import {
  availableMonitors,
  currentMonitor,
  getCurrentWindow,
  PhysicalPosition,
  PhysicalSize,
  type Monitor,
} from '@tauri-apps/api/window'
import { emitTo } from '@tauri-apps/api/event'
import { getAllWebviewWindows, WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { closeScreensaverWindows } from './tauri-commands'

export type AppWindowLabel = 'main' | 'tray-panel' | 'screensaver' | 'settings'

const LEGACY_SCREENSAVER_LABEL = 'screensaver'
const SCREENSAVER_LABEL_PREFIX = 'screensaver-'
const MONITOR_RECONCILE_INTERVAL_MS = 1500
const EVENT_SYNC_SCREENSAVER_SESSION = 'antisleep://request-sync-screensaver-session'
const EVENT_STOP_SCREENSAVER_SESSION = 'antisleep://request-stop-screensaver-session'

let monitorPollTimer: ReturnType<typeof setInterval> | null = null
let monitorPollInFlight = false
let lastMonitorSignature = ''
let screensaverOpenInFlight: Promise<void> | null = null

function isAppWindowLabel(value: string): value is AppWindowLabel {
  return value === 'main' || value === 'tray-panel' || value === 'screensaver' || value === 'settings'
}

function normalizeLabel(label: string): AppWindowLabel {
  if (isScreensaverWindowLabel(label)) return 'screensaver'
  return isAppWindowLabel(label) ? label : 'main'
}

function isScreensaverWindowLabel(label: string): boolean {
  return label === LEGACY_SCREENSAVER_LABEL || label.startsWith(SCREENSAVER_LABEL_PREFIX)
}

function getCurrentRawWindowLabel(): string | null {
  if (typeof window === 'undefined') return null

  const webviewLabel = window.__TAURI_INTERNALS__?.metadata?.currentWebview?.label
  if (webviewLabel) return webviewLabel

  const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label
  if (windowLabel) return windowLabel

  return new URLSearchParams(window.location.search).get('label')
}

function sortMonitors(monitors: Monitor[]): Monitor[] {
  return [...monitors].sort((a, b) => {
    if (a.position.x !== b.position.x) return a.position.x - b.position.x
    if (a.position.y !== b.position.y) return a.position.y - b.position.y
    if (a.scaleFactor !== b.scaleFactor) return a.scaleFactor - b.scaleFactor
    return (a.name ?? '').localeCompare(b.name ?? '')
  })
}

function monitorToLogicalBounds(monitor: Monitor) {
  const logicalPosition = monitor.position.toLogical(monitor.scaleFactor)
  const logicalSize = monitor.size.toLogical(monitor.scaleFactor)

  return {
    x: Math.round(logicalPosition.x),
    y: Math.round(logicalPosition.y),
    width: Math.max(1, Math.round(logicalSize.width)),
    height: Math.max(1, Math.round(logicalSize.height)),
  }
}

function monitorToPhysicalBounds(monitor: Monitor) {
  return {
    x: Math.round(monitor.position.x),
    y: Math.round(monitor.position.y),
    width: Math.max(1, Math.round(monitor.size.width)),
    height: Math.max(1, Math.round(monitor.size.height)),
  }
}

function buildMonitorSignature(monitors: Monitor[]): string {
  return sortMonitors(monitors)
    .map((monitor) => {
      const bounds = monitorToPhysicalBounds(monitor)
      return [
        monitor.name ?? 'unknown',
        monitor.scaleFactor,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
      ].join(':')
    })
    .join('|')
}

async function waitForWindowCreated(window: WebviewWindow): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const fail = (event: { payload?: unknown }) => {
      if (settled) return
      settled = true
      reject(event.payload ?? new Error(`Failed to create window: ${window.label}`))
    }

    window.once('tauri://created', done).catch(reject)
    window.once('tauri://error', fail).catch(() => {})
    setTimeout(done, 500)
  })
}

async function getScreensaverWindows(): Promise<WebviewWindow[]> {
  const windows = await getAllWebviewWindows()
  return windows.filter((window) => isScreensaverWindowLabel(window.label))
}

async function applyMonitorLayout(window: WebviewWindow, monitor: Monitor): Promise<void> {
  const bounds = monitorToPhysicalBounds(monitor)

  await window.setFullscreen(false).catch(() => {})
  await window.setSimpleFullscreen(false).catch(() => {})

  await Promise.allSettled([
    window.setPosition(new PhysicalPosition(bounds.x, bounds.y)),
    window.setSize(new PhysicalSize(bounds.width, bounds.height)),
  ])

  await window.show().catch(() => {})

  await Promise.allSettled([
    window.setPosition(new PhysicalPosition(bounds.x, bounds.y)),
    window.setSize(new PhysicalSize(bounds.width, bounds.height)),
  ])

  try {
    await window.setFullscreen(true)
  } catch {
    await window.setSimpleFullscreen(true).catch(() => {})
  }
  await window.setFocus().catch(() => {})
  await window.setContentProtected(true).catch(() => {})
}

async function ensureScreensaverWindow(label: string, monitor: Monitor): Promise<WebviewWindow> {
  const bounds = monitorToLogicalBounds(monitor)
  let window = await WebviewWindow.getByLabel(label)

  if (!window) {
    window = new WebviewWindow(label, {
      url: `/?label=${label}`,
      title: label === LEGACY_SCREENSAVER_LABEL ? 'AntiSleep Screensaver' : `AntiSleep Screensaver ${label.slice(SCREENSAVER_LABEL_PREFIX.length)}`,
      decorations: false,
      fullscreen: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      contentProtected: true,
      visible: false,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      backgroundColor: '#000000',
    })

    await waitForWindowCreated(window)
  }

  await window.setVisibleOnAllWorkspaces(false).catch(() => {})
  await applyMonitorLayout(window, monitor)
  return window
}

async function stopScreensaverSessionOnMain(): Promise<boolean> {
  const currentLabel = getCurrentRawWindowLabel()
  if (!currentLabel || currentLabel === 'main') return false

  try {
    await emitTo('main', EVENT_STOP_SCREENSAVER_SESSION)
    return true
  } catch {
    return false
  }
}

async function syncScreensaverSessionToMain(): Promise<void> {
  const currentLabel = getCurrentRawWindowLabel()
  if (!currentLabel || currentLabel === 'main') return

  try {
    await emitTo('main', EVENT_SYNC_SCREENSAVER_SESSION)
  } catch {}
}

async function reconcileScreensaverWindows(options?: { focus?: boolean; forceShow?: boolean }): Promise<WebviewWindow[]> {
  const monitors = sortMonitors(await availableMonitors())
  if (!monitors.length) return []

  const signature = buildMonitorSignature(monitors)
  const expectedLabels = monitors.length <= 1
    ? [LEGACY_SCREENSAVER_LABEL]
    : monitors.map((_, index) => `${SCREENSAVER_LABEL_PREFIX}${index}`)

  const existingWindows = await getScreensaverWindows()
  const existingLabelSet = new Set(existingWindows.map((window) => window.label))
  const expectedReady = expectedLabels.every((label) => existingLabelSet.has(label))

  if (signature === lastMonitorSignature && expectedReady) {
    if (options?.forceShow || options?.focus) {
      for (const [index, label] of expectedLabels.entries()) {
        const window = existingWindows.find((item) => item.label === label)
        if (window) {
          await applyMonitorLayout(window, monitors[index])
        }
      }
      if (options?.focus) {
        const focusWindow = existingWindows.find((window) => expectedLabels.includes(window.label))
        if (focusWindow) {
          await focusWindow.setFocus().catch(() => {})
        }
      }
    }
    return existingWindows
  }

  const staleWindows = existingWindows.filter((window) => !expectedLabels.includes(window.label))
  await Promise.allSettled(staleWindows.map((window) => window.close()))

  const ensuredWindows: WebviewWindow[] = []
  for (const [index, monitor] of monitors.entries()) {
    ensuredWindows.push(await ensureScreensaverWindow(expectedLabels[index], monitor))
  }

  if (options?.focus && ensuredWindows[0]) {
    await ensuredWindows[0].setFocus().catch(() => {})
  }

  lastMonitorSignature = signature
  return ensuredWindows
}

function startMonitorPolling() {
  if (monitorPollTimer) return

  monitorPollTimer = setInterval(() => {
    if (monitorPollInFlight) return

    monitorPollInFlight = true
    reconcileScreensaverWindows()
      .catch((error) => {
        console.warn('[screensaver] monitor reconciliation failed:', error)
      })
      .finally(() => {
        monitorPollInFlight = false
      })
  }, MONITOR_RECONCILE_INTERVAL_MS)
}

export function stopScreensaverSession(): void {
  if (monitorPollTimer) {
    clearInterval(monitorPollTimer)
    monitorPollTimer = null
  }

  monitorPollInFlight = false
  lastMonitorSignature = ''
}

export function getCurrentAppWindowLabel(): AppWindowLabel {
  return normalizeLabel(getCurrentRawWindowLabel() ?? 'main')
}

export async function getConnectedMonitorCount(): Promise<number> {
  try {
    const monitors = await availableMonitors()
    return monitors.length
  } catch {
    return 1
  }
}

export async function syncScreensaverSession(): Promise<void> {
  await reconcileScreensaverWindows()
  startMonitorPolling()
}

export async function openScreensaver(): Promise<void> {
  if (screensaverOpenInFlight) {
    return screensaverOpenInFlight
  }

  screensaverOpenInFlight = (async () => {
    stopScreensaverSession()
    await closeScreensaverWindows().catch(() => {})
    await reconcileScreensaverWindows({ focus: true, forceShow: true })
    startMonitorPolling()
    void syncScreensaverSessionToMain()
  })()

  try {
    await screensaverOpenInFlight
  } finally {
    screensaverOpenInFlight = null
  }
}

export async function closeAllScreensavers(): Promise<void> {
  await stopScreensaverSessionOnMain()
  stopScreensaverSession()

  try {
    await closeScreensaverWindows()
    return
  } catch {}

  const windows = await getScreensaverWindows()
  await Promise.allSettled(windows.map((window) => window.close()))
}

export async function openAppWindow(label: Exclude<AppWindowLabel, 'main'>): Promise<void> {
  if (label === 'screensaver') {
    await openScreensaver()
    return
  }

  const existing = await WebviewWindow.getByLabel(label)
  if (existing) {
    await existing.show()
    await existing.setFocus()
    return
  }

  switch (label) {
    case 'tray-panel':
      new WebviewWindow(label, {
        url: '/?label=tray-panel',
        title: 'AntiSleep',
        width: 380,
        height: 480,
        decorations: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
      })
      return
    case 'settings': {
      const monitor = await currentMonitor()
      const screenWidth = monitor?.size.width ?? 1920
      const screenHeight = monitor?.size.height ?? 1080
      const scaleFactor = monitor?.scaleFactor ?? 1
      const winWidth = Math.round((screenWidth / scaleFactor) * 0.8)
      const winHeight = Math.round((screenHeight / scaleFactor) * 0.8)
      new WebviewWindow(label, {
        url: '/?label=settings',
        title: 'AntiSleep Settings',
        width: winWidth,
        height: winHeight,
        center: true,
        resizable: true,
        minWidth: Math.round(winWidth * 0.7),
        minHeight: 600,
      })
      return
    }
  }
}

export async function closeCurrentAppWindow(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  const label = getCurrentRawWindowLabel()
  if (label && isScreensaverWindowLabel(label)) {
    await closeAllScreensavers()
    return
  }

  if (window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label) {
    await getCurrentWindow().close()
    return
  }

  window.close()
}
