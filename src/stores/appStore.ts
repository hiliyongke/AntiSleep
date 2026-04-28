import { create } from 'zustand'
import {
  type PreventionState,
  type PreventionMode,
  type DurationOption,
  type WallpaperState,
  type ThemeState,
  type ThemeId,
  type ParticleDensity,
  type MarqueeState,
  type MarqueeItem,
  type MarqueeMode,
  type MarqueeSpeed,
  type MarqueePosition,
  type SmartSceneState,
  type AppSettings,
  type LockScreenState,
  type LockType,
} from '../types'
import {
  startPrevention,
  stopPrevention,
  getRemainingTime,
  listProcesses,
  isCharging,
} from '../lib/tauri-commands'
import {
  persistGet,
  persistSet,
  syncedSet,
  subscribeStateChanges,
  selfWebviewId,
} from '../lib/persist'
import {
  applyAutostart,
  checkAutostart,
  registerShortcut,
  unregisterAllShortcuts,
} from '../lib/system-services'
import { openAppWindow } from '../lib/window'

// Simple hash for PIN/gesture (client-side, not crypto-grade)
async function hashSecret(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input + 'antisleep-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Persistence keys
const K_SETTINGS = 'settings'
const K_WALLPAPER = 'wallpaper'
const K_THEME = 'theme'
const K_MARQUEE = 'marquee'
const K_SMART = 'smartScene'
const K_LOCK = 'lockScreen'

/** Persist + broadcast to every other window */
function sync<T>(key: string, value: T): Promise<void> {
  return syncedSet(key, value, selfWebviewId)
}

interface AppStore {
  // Prevention
  prevention: PreventionState
  // Wallpaper
  wallpaper: WallpaperState
  // Theme
  theme: ThemeState
  // Marquee
  marquee: MarqueeState
  // Smart scene
  smartScene: SmartSceneState
  // Lock screen
  lockScreen: LockScreenState
  // Settings
  settings: AppSettings
  // UI state
  trayPanelOpen: boolean
  screensaverVisible: boolean
  // Internal flag
  _hydrated: boolean

  // Actions
  initApp: () => Promise<void>
  togglePrevention: () => void
  startPreventionAction: (mode: PreventionMode, duration: DurationOption) => void
  stopPreventionAction: () => void
  setPreventionMode: (mode: PreventionMode) => void
  setDuration: (duration: DurationOption) => void

  // Wallpaper actions
  setWallpaper: (id: string) => void
  setWallpaperOpacity: (opacity: number) => void
  addCustomWallpaper: (path: string) => void
  removeCustomWallpaper: (id: string) => void

  // Theme actions
  setTheme: (themeId: ThemeId) => void
  setThemeOpacity: (opacity: number) => void
  setThemeSpeed: (speed: number) => void
  setThemeDensity: (density: ParticleDensity) => void
  setThemeEnabled: (enabled: boolean) => void
  setThemeCustomColor: (color: string) => void

  // Marquee actions
  setMarqueeEnabled: (enabled: boolean) => void
  setMarqueeMode: (mode: MarqueeMode) => void
  setMarqueeSpeed: (speed: MarqueeSpeed) => void
  setMarqueePosition: (position: MarqueePosition) => void
  addMarqueeItem: (item: MarqueeItem) => void
  updateMarqueeItem: (id: string, updates: Partial<MarqueeItem>) => void
  removeMarqueeItem: (id: string) => void
  reorderMarqueeItems: (items: MarqueeItem[]) => void

  // Smart scene actions
  setAutoOnCharge: (enabled: boolean) => void
  setProcessNames: (names: string[]) => void

  // Settings actions
  setAutoStart: (enabled: boolean) => Promise<void>
  setShortcut: (key: 'shortcutEnable' | 'shortcutDisable' | 'shortcutScreensaver', combo: string) => Promise<void>

  // Lock screen actions
  setLockEnabled: (enabled: boolean) => void
  setLockType: (lockType: LockType) => void
  setPinCode: (pin: string) => Promise<void>
  setGesturePattern: (pattern: string) => Promise<void>
  setAutoLockDelay: (delay: number) => void
  activateLockScreen: () => void
  unlockWithPin: (pin: string) => Promise<boolean>
  unlockWithGesture: (pattern: string) => Promise<boolean>
  resetFailedAttempts: () => void

  // UI actions
  setTrayPanelOpen: (open: boolean) => void
  setScreensaverVisible: (visible: boolean) => void
}

const defaultPrevention: PreventionState = {
  active: false,
  mode: 'system',
  duration: 60,
  startTime: null,
  assertionId: null,
}

const defaultWallpaper: WallpaperState = {
  current: {
    id: 'built-in-black',
    type: 'built-in',
    name: '纯黑',
    path: '',
  },
  opacity: 100,
  builtIn: [
    { id: 'built-in-black', type: 'built-in', name: '纯黑', path: '' },
    { id: 'built-in-deep-space', type: 'built-in', name: '深空星云', path: 'gradient:deep-space' },
    { id: 'built-in-forest', type: 'built-in', name: '暗夜森林', path: 'gradient:forest' },
    { id: 'built-in-cyber', type: 'built-in', name: '赛博城市', path: 'gradient:cyber' },
    { id: 'built-in-gradient', type: 'built-in', name: '渐变深渊', path: 'gradient:abyss' },
  ],
  custom: [],
}

const defaultTheme: ThemeState = {
  current: 'particle-network',
  opacity: 60,
  speed: 1.0,
  density: 'medium',
  enabled: true,
  customColor: '#0078D4',
}

const defaultMarquee: MarqueeState = {
  enabled: false,
  items: [
    { id: '1', content: 'AI 训练进行中，请勿锁屏', fontSize: 32, color: '#FFFFFF', glowEnabled: true, glowColor: '#0078D4', glowIntensity: 10 },
    { id: '2', content: '保持专注，持续创造', fontSize: 28, color: '#FFFFFF', glowEnabled: true, glowColor: '#0078D4', glowIntensity: 8 },
  ],
  mode: 'horizontal',
  speed: 'medium',
  position: 'center-bottom',
}

const defaultSmartScene: SmartSceneState = {
  autoOnCharge: false,
  processNames: [],
}

const defaultLockScreen: LockScreenState = {
  enabled: false,
  lockType: 'pin',
  pinHash: null,
  gestureHash: null,
  autoLockDelay: 0,
  locked: false,
  failedAttempts: 0,
  lastFailedTime: null,
}

const defaultSettings: AppSettings = {
  autoStart: false,
  defaultMode: 'system',
  defaultDuration: 60,
  shortcutEnable: 'CommandOrControl+Shift+S',
  shortcutDisable: 'CommandOrControl+Shift+X',
  shortcutScreensaver: 'CommandOrControl+Shift+F',
}

// Smart-scene polling timer
let smartSceneTimer: ReturnType<typeof setInterval> | null = null

async function pollSmartScene() {
  const { smartScene, prevention } = useAppStore.getState()
  const active = prevention.active

  // 1) Charging detection
  if (smartScene.autoOnCharge) {
    try {
      const charging = await isCharging()
      if (charging && !active) {
        useAppStore.getState().startPreventionAction(prevention.mode, prevention.duration)
        return
      }
      if (!charging && active) {
        useAppStore.getState().stopPreventionAction()
        return
      }
    } catch {}
  }

  // 2) Process detection
  if (smartScene.processNames.length > 0) {
    try {
      const running = await listProcesses()
      const loweredRunning = running.map((n) => n.toLowerCase())
      const wanted = smartScene.processNames.map((n) => n.toLowerCase())
      const anyRunning = wanted.some((w) =>
        loweredRunning.some((r) => r === w || r.includes(w)),
      )
      if (anyRunning && !active) {
        useAppStore.getState().startPreventionAction(prevention.mode, prevention.duration)
      } else if (!anyRunning && active && !smartScene.autoOnCharge) {
        useAppStore.getState().stopPreventionAction()
      }
    } catch {}
  }
}

function ensureSmartSceneLoop() {
  const { smartScene } = useAppStore.getState()
  const enabled = smartScene.autoOnCharge || smartScene.processNames.length > 0
  if (enabled && !smartSceneTimer) {
    smartSceneTimer = setInterval(pollSmartScene, 10000)
  } else if (!enabled && smartSceneTimer) {
    clearInterval(smartSceneTimer)
    smartSceneTimer = null
  }
}

async function registerAllShortcuts() {
  const { settings } = useAppStore.getState()
  await unregisterAllShortcuts()
  await registerShortcut(settings.shortcutEnable, () => {
    const s = useAppStore.getState()
    if (!s.prevention.active) s.startPreventionAction(s.prevention.mode, s.prevention.duration)
  }, 'enable')
  await registerShortcut(settings.shortcutDisable, () => {
    const s = useAppStore.getState()
    if (s.prevention.active) s.stopPreventionAction()
  }, 'disable')
  await registerShortcut(settings.shortcutScreensaver, () => {
    openAppWindow('screensaver').catch(() => {})
  }, 'screensaver')
}

export const useAppStore = create<AppStore>((set, get) => ({
  prevention: defaultPrevention,
  wallpaper: defaultWallpaper,
  theme: defaultTheme,
  marquee: defaultMarquee,
  smartScene: defaultSmartScene,
  lockScreen: defaultLockScreen,
  settings: defaultSettings,
  trayPanelOpen: false,
  screensaverVisible: false,
  _hydrated: false,

  initApp: async () => {
    // 1) Hydrate from persistent store
    const [sSettings, sWall, sTheme, sMarq, sSmart, sLock] = await Promise.all([
      persistGet<AppSettings>(K_SETTINGS),
      persistGet<WallpaperState>(K_WALLPAPER),
      persistGet<ThemeState>(K_THEME),
      persistGet<MarqueeState>(K_MARQUEE),
      persistGet<SmartSceneState>(K_SMART),
      persistGet<LockScreenState>(K_LOCK),
    ])

    set({
      settings: sSettings ? { ...defaultSettings, ...sSettings } : defaultSettings,
      wallpaper: sWall
        ? { ...defaultWallpaper, ...sWall, builtIn: defaultWallpaper.builtIn }
        : defaultWallpaper,
      theme: sTheme ? { ...defaultTheme, ...sTheme } : defaultTheme,
      marquee: sMarq ? { ...defaultMarquee, ...sMarq } : defaultMarquee,
      smartScene: sSmart ? { ...defaultSmartScene, ...sSmart } : defaultSmartScene,
      lockScreen: sLock
        ? { ...defaultLockScreen, ...sLock, locked: false, failedAttempts: 0 }
        : defaultLockScreen,
      prevention: {
        ...defaultPrevention,
        mode: sSettings?.defaultMode ?? defaultPrevention.mode,
        duration: (sSettings?.defaultDuration ?? defaultPrevention.duration) as DurationOption,
      },
      _hydrated: true,
    })

    // 2) Sync autostart with the OS once (in case external change happened)
    try {
      const osEnabled = await checkAutostart()
      const stored = get().settings.autoStart
      if (osEnabled !== stored) {
        set({ settings: { ...get().settings, autoStart: osEnabled } })
        await persistSet(K_SETTINGS, get().settings)
      }
    } catch {}

    // 3) Register global shortcuts
    await registerAllShortcuts()

    // 4) Start smart-scene loop if needed
    ensureSmartSceneLoop()

    // 5) Subscribe to cross-window state changes — reload the affected
    //    slice when another webview writes to the persistent store.
    await subscribeStateChanges(selfWebviewId, async (key) => {
      switch (key) {
        case K_SETTINGS: {
          const v = await persistGet<AppSettings>(K_SETTINGS)
          if (v) set({ settings: { ...defaultSettings, ...v } })
          break
        }
        case K_WALLPAPER: {
          const v = await persistGet<WallpaperState>(K_WALLPAPER)
          if (v) set({ wallpaper: { ...defaultWallpaper, ...v, builtIn: defaultWallpaper.builtIn } })
          break
        }
        case K_THEME: {
          const v = await persistGet<ThemeState>(K_THEME)
          if (v) set({ theme: { ...defaultTheme, ...v } })
          break
        }
        case K_MARQUEE: {
          const v = await persistGet<MarqueeState>(K_MARQUEE)
          if (v) set({ marquee: { ...defaultMarquee, ...v } })
          break
        }
        case K_SMART: {
          const v = await persistGet<SmartSceneState>(K_SMART)
          if (v) {
            set({ smartScene: { ...defaultSmartScene, ...v } })
            ensureSmartSceneLoop()
          }
          break
        }
        case K_LOCK: {
          const v = await persistGet<LockScreenState>(K_LOCK)
          if (v) set({ lockScreen: { ...get().lockScreen, ...v } })
          break
        }
      }
    })
  },

  togglePrevention: () => {
    const { prevention } = get()
    if (prevention.active) {
      get().stopPreventionAction()
    } else {
      get().startPreventionAction(prevention.mode, prevention.duration)
    }
  },

  startPreventionAction: async (mode, duration) => {
    try {
      const assertionId = await startPrevention(mode)
      set({
        prevention: {
          ...get().prevention,
          active: true,
          mode,
          duration,
          startTime: Date.now(),
          assertionId,
        },
      })
    } catch (e) {
      console.error('Failed to start prevention:', e)
    }
  },

  stopPreventionAction: async () => {
    const { prevention } = get()
    try {
      if (prevention.assertionId !== null) {
        await stopPrevention(prevention.assertionId)
      }
      set({
        prevention: {
          ...defaultPrevention,
          mode: prevention.mode,
          duration: prevention.duration,
        },
      })
    } catch (e) {
      console.error('Failed to stop prevention:', e)
      set({
        prevention: {
          ...defaultPrevention,
          mode: prevention.mode,
          duration: prevention.duration,
        },
      })
    }
  },

  setPreventionMode: (mode) => {
    set({ prevention: { ...get().prevention, mode } })
    const s = { ...get().settings, defaultMode: mode }
    set({ settings: s })
    sync(K_SETTINGS, s)
  },

  setDuration: (duration) => {
    set({ prevention: { ...get().prevention, duration } })
    const s = { ...get().settings, defaultDuration: duration }
    set({ settings: s })
    sync(K_SETTINGS, s)
  },

  // Wallpaper
  setWallpaper: (id) => {
    const { wallpaper } = get()
    const all = [...wallpaper.builtIn, ...wallpaper.custom]
    const found = all.find((w) => w.id === id)
    if (found) {
      const next = { ...wallpaper, current: found }
      set({ wallpaper: next })
      sync(K_WALLPAPER, next)
    }
  },

  setWallpaperOpacity: (opacity) => {
    const next = { ...get().wallpaper, opacity }
    set({ wallpaper: next })
    sync(K_WALLPAPER, next)
  },

  addCustomWallpaper: (path) => {
    const item: import('../types').WallpaperSource = {
      id: `custom-${Date.now()}`,
      type: path.match(/\.(mp4|webm)$/i) ? 'video' : 'image',
      name: path.split(/[\\/]/).pop() || path,
      path,
    }
    const next = {
      ...get().wallpaper,
      custom: [...get().wallpaper.custom, item],
      current: item,
    }
    set({ wallpaper: next })
    sync(K_WALLPAPER, next)
  },

  removeCustomWallpaper: (id) => {
    const { wallpaper } = get()
    const next = {
      ...wallpaper,
      custom: wallpaper.custom.filter((w) => w.id !== id),
      current: wallpaper.current?.id === id ? wallpaper.builtIn[0] : wallpaper.current,
    }
    set({ wallpaper: next })
    sync(K_WALLPAPER, next)
  },

  // Theme
  setTheme: (themeId) => {
    const next = { ...get().theme, current: themeId }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeOpacity: (opacity) => {
    const next = { ...get().theme, opacity }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeSpeed: (speed) => {
    const next = { ...get().theme, speed }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeDensity: (density) => {
    const next = { ...get().theme, density }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeEnabled: (enabled) => {
    const next = { ...get().theme, enabled }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeCustomColor: (color) => {
    const next = { ...get().theme, customColor: color }
    set({ theme: next }); sync(K_THEME, next)
  },

  // Marquee
  setMarqueeEnabled: (enabled) => {
    const next = { ...get().marquee, enabled }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  setMarqueeMode: (mode) => {
    const next = { ...get().marquee, mode }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  setMarqueeSpeed: (speed) => {
    const next = { ...get().marquee, speed }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  setMarqueePosition: (position) => {
    const next = { ...get().marquee, position }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  addMarqueeItem: (item) => {
    const next = { ...get().marquee, items: [...get().marquee.items, item] }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  updateMarqueeItem: (id, updates) => {
    const next = {
      ...get().marquee,
      items: get().marquee.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  removeMarqueeItem: (id) => {
    const next = {
      ...get().marquee,
      items: get().marquee.items.filter((item) => item.id !== id),
    }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  reorderMarqueeItems: (items) => {
    const next = { ...get().marquee, items }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },

  // Smart scene
  setAutoOnCharge: (enabled) => {
    const next = { ...get().smartScene, autoOnCharge: enabled }
    set({ smartScene: next }); sync(K_SMART, next)
    ensureSmartSceneLoop()
  },
  setProcessNames: (names) => {
    const next = { ...get().smartScene, processNames: names }
    set({ smartScene: next }); sync(K_SMART, next)
    ensureSmartSceneLoop()
  },

  // Settings
  setAutoStart: async (enabled) => {
    await applyAutostart(enabled)
    const next = { ...get().settings, autoStart: enabled }
    set({ settings: next })
    await sync(K_SETTINGS, next)
  },
  setShortcut: async (key, combo) => {
    const next = { ...get().settings, [key]: combo }
    set({ settings: next })
    await sync(K_SETTINGS, next)
    await registerAllShortcuts()
  },

  // Lock screen
  setLockEnabled: (enabled) => {
    const next = { ...get().lockScreen, enabled }
    set({ lockScreen: next }); sync(K_LOCK, next)
  },
  setLockType: (lockType) => {
    const next = { ...get().lockScreen, lockType }
    set({ lockScreen: next }); sync(K_LOCK, next)
  },
  setPinCode: async (pin: string) => {
    const pinHash = await hashSecret(pin)
    const next = { ...get().lockScreen, pinHash, enabled: true }
    set({ lockScreen: next }); sync(K_LOCK, next)
  },
  setGesturePattern: async (pattern: string) => {
    const gestureHash = await hashSecret(pattern)
    const next = { ...get().lockScreen, gestureHash, enabled: true }
    set({ lockScreen: next }); sync(K_LOCK, next)
  },
  setAutoLockDelay: (delay) => {
    const next = { ...get().lockScreen, autoLockDelay: delay }
    set({ lockScreen: next }); sync(K_LOCK, next)
  },
  activateLockScreen: () => set({ lockScreen: { ...get().lockScreen, locked: true } }),
  unlockWithPin: async (pin: string): Promise<boolean> => {
    const { lockScreen } = get()
    if (!lockScreen.pinHash) return false
    const inputHash = await hashSecret(pin)
    if (inputHash === lockScreen.pinHash) {
      set({ lockScreen: { ...lockScreen, locked: false, failedAttempts: 0, lastFailedTime: null } })
      return true
    }
    set({ lockScreen: { ...lockScreen, failedAttempts: lockScreen.failedAttempts + 1, lastFailedTime: Date.now() } })
    return false
  },
  unlockWithGesture: async (pattern: string): Promise<boolean> => {
    const { lockScreen } = get()
    if (!lockScreen.gestureHash) return false
    const inputHash = await hashSecret(pattern)
    if (inputHash === lockScreen.gestureHash) {
      set({ lockScreen: { ...lockScreen, locked: false, failedAttempts: 0, lastFailedTime: null } })
      return true
    }
    set({ lockScreen: { ...lockScreen, failedAttempts: lockScreen.failedAttempts + 1, lastFailedTime: Date.now() } })
    return false
  },
  resetFailedAttempts: () => set({ lockScreen: { ...get().lockScreen, failedAttempts: 0 } }),

  // UI
  setTrayPanelOpen: (open) => set({ trayPanelOpen: open }),
  setScreensaverVisible: (visible) => set({ screensaverVisible: visible }),
}))

// Suppress unused-import warning in non-Tauri builds
void getRemainingTime
