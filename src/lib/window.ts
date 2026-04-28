import { getCurrentWindow, currentMonitor } from '@tauri-apps/api/window'
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

export type AppWindowLabel = 'main' | 'tray-panel' | 'screensaver' | 'settings'

function isAppWindowLabel(value: string): value is AppWindowLabel {
  return value === 'main' || value === 'tray-panel' || value === 'screensaver' || value === 'settings'
}

export function getCurrentAppWindowLabel(): AppWindowLabel {
  if (typeof window === 'undefined') {
    return 'main'
  }

  if (window.__TAURI_INTERNALS__?.metadata?.currentWebview?.label) {
    const label = getCurrentWebviewWindow().label
    return isAppWindowLabel(label) ? label : 'main'
  }

  const label = new URLSearchParams(window.location.search).get('label')
  return label && isAppWindowLabel(label) ? label : 'main'
}

export async function openAppWindow(label: Exclude<AppWindowLabel, 'main'>): Promise<void> {
  const existing = await WebviewWindow.getByLabel(label)
  if (existing) {
    await existing.setFocus()
    return
  }

  switch (label) {
    case 'tray-panel':
      new WebviewWindow(label, {
        url: '/',
        title: 'AntiSleep',
        width: 380,
        height: 480,
        decorations: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
      })
      return
    case 'screensaver':
      new WebviewWindow(label, {
        url: '/',
        title: 'AntiSleep Screensaver',
        decorations: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
      })
      // Apply content protection after creation (prevents screen capture/recording)
      WebviewWindow.getByLabel(label).then((w) => {
        if (w) w.setContentProtected(true).catch(() => {})
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
        url: '/',
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

  if (window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label) {
    await getCurrentWindow().close()
    return
  }

  window.close()
}
