import { create } from 'zustand'
import { listen } from '@tauri-apps/api/event'
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
  type TextAnimation,
  type SmartSceneState,
  type AppSettings,
  type ThemePreference,
} from '../types'
import {
  startPrevention,
  stopPrevention,
  getRemainingTime,
  listProcesses,
  listProcessesDetailed,
  isCharging,
} from '../lib/tauri-commands'
import {
  persistGet,
  persistSet,
  persistRemove,
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

// Persistence keys
const K_SETTINGS = 'settings'
const K_WALLPAPER = 'wallpaper'
const K_THEME = 'theme'
const K_MARQUEE = 'marquee'
const K_SMART = 'smartScene'

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
  setWallpaperBlur: (blur: number) => void
  addCustomWallpaper: (path: string) => void
  removeCustomWallpaper: (id: string) => void

  // Theme actions
  setTheme: (themeId: ThemeId) => void
  setThemeOpacity: (opacity: number) => void
  setThemeSpeed: (speed: number) => void
  setThemeDensity: (density: ParticleDensity) => void
  setThemeEnabled: (enabled: boolean) => void
  setThemeCustomColor: (color: string) => void
  setClockStyle: (style: import('../types').ClockStyle) => void
  resetToFactory: () => Promise<void>

  // Marquee actions
  setMarqueeEnabled: (enabled: boolean) => void
  setMarqueeMode: (mode: MarqueeMode) => void
  setMarqueeSpeed: (speed: MarqueeSpeed) => void
  setMarqueePosition: (position: MarqueePosition) => void
  setMarqueeAnimation: (animation: TextAnimation) => void
  setMarqueeDisplayStrategy: (strategy: 'single' | 'cycle' | 'all') => void
  addMarqueeItem: (item: MarqueeItem) => void
  updateMarqueeItem: (id: string, updates: Partial<MarqueeItem>) => void
  removeMarqueeItem: (id: string) => void
  reorderMarqueeItems: (items: MarqueeItem[]) => void
  toggleMarqueeItemEnabled: (id: string) => void

  // Smart scene actions
  setAutoOnCharge: (enabled: boolean) => void
  setProcessNames: (names: string[]) => void

  // Settings actions
  setAutoStart: (enabled: boolean) => Promise<void>
  setShortcut: (key: 'shortcutEnable' | 'shortcutDisable' | 'shortcutScreensaver', combo: string) => Promise<void>
  setMinimizeToTray: (enabled: boolean) => void
  setExpiryWarning: (enabled: boolean) => void
  setExpiryWarningMinutes: (minutes: number) => void
  setSoundEnabled: (enabled: boolean) => void
  setLanguage: (language: 'zh-CN' | 'en-US') => void
  setPollIntervalSeconds: (seconds: number) => void
  setThemePreference: (preference: ThemePreference) => void
  setIdleScreensaverMinutes: (minutes: number) => void
  completeOnboarding: () => void

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
  blur: 0,
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
  clockStyle: 'analog',
}

const defaultMarquee: MarqueeState = {
  enabled: false,
  items: [
    { id: '1', content: 'AI 训练进行中，请勿锁屏', fontSize: 32, color: '#FFFFFF', glowEnabled: true, glowColor: '#0078D4', glowIntensity: 10, enabled: true },
    { id: '2', content: '保持专注，持续创造', fontSize: 28, color: '#FFFFFF', glowEnabled: true, glowColor: '#0078D4', glowIntensity: 8, enabled: true },
  ],
  mode: 'horizontal',
  speed: 'medium',
  position: 'center-bottom',
  animation: 'none',
  displayStrategy: 'cycle',
}

const defaultSmartScene: SmartSceneState = {
  autoOnCharge: false,
  processNames: [],
}

const defaultSettings: AppSettings = {
  autoStart: false,
  defaultMode: 'system',
  defaultDuration: 60,
  shortcutEnable: 'CommandOrControl+Shift+S',
  shortcutDisable: 'CommandOrControl+Shift+X',
  shortcutScreensaver: 'CommandOrControl+Shift+F',
  minimizeToTray: true,
  expiryWarning: true,
  expiryWarningMinutes: 5,
  soundEnabled: true,
  language: 'zh-CN',
  pollIntervalSeconds: 10,
  themePreference: 'system',
  idleScreensaverMinutes: 0,
  onboardingCompleted: false,
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
      if (!charging && active && smartScene.processNames.length === 0) {
        // Only stop if process detection is NOT also active
        useAppStore.getState().stopPreventionAction()
        return
      }
      // If charging stopped but process detection is active, fall through
      // to let process detection decide
      if (!charging && active && smartScene.processNames.length > 0) {
        // Fall through to process check — don't stop yet
      }
    } catch (e) {
      console.warn('[SmartScene] Charging detection failed:', e)
    }
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
      } else if (!anyRunning && active) {
        // Stop only if charging is not keeping it active
        if (!smartScene.autoOnCharge) {
          useAppStore.getState().stopPreventionAction()
        } else {
          // Check charging state before stopping
          try {
            const charging = await isCharging()
            if (!charging) {
              useAppStore.getState().stopPreventionAction()
            }
          } catch {
            // If we can't check charging, stop to be safe
            useAppStore.getState().stopPreventionAction()
          }
        }
      }
    } catch (e) {
      console.warn('[SmartScene] Process detection failed:', e)
    }
  }
}

function ensureSmartSceneLoop() {
  const { smartScene, settings } = useAppStore.getState()
  const enabled = smartScene.autoOnCharge || smartScene.processNames.length > 0
  const interval = (settings.pollIntervalSeconds || 10) * 1000
  if (enabled && !smartSceneTimer) {
    smartSceneTimer = setInterval(pollSmartScene, interval)
  } else if (!enabled && smartSceneTimer) {
    clearInterval(smartSceneTimer)
    smartSceneTimer = null
  }
}

function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = preference === 'dark' || (preference === 'system' && systemDark)

  if (isDark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
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
  settings: defaultSettings,
  trayPanelOpen: false,
  screensaverVisible: false,
  _hydrated: false,

  initApp: async () => {
    // 1) Hydrate from persistent store
    const [sSettings, sWall, sTheme, sMarq, sSmart] = await Promise.all([
      persistGet<AppSettings>(K_SETTINGS),
      persistGet<WallpaperState>(K_WALLPAPER),
      persistGet<ThemeState>(K_THEME),
      persistGet<MarqueeState>(K_MARQUEE),
      persistGet<SmartSceneState>(K_SMART),
    ])

    set({
      settings: sSettings ? { ...defaultSettings, ...sSettings } : defaultSettings,
      wallpaper: sWall
        ? { ...defaultWallpaper, ...sWall, builtIn: defaultWallpaper.builtIn }
        : defaultWallpaper,
      theme: sTheme ? { ...defaultTheme, ...sTheme } : defaultTheme,
      marquee: sMarq ? { ...defaultMarquee, ...sMarq } : defaultMarquee,
      smartScene: sSmart ? { ...defaultSmartScene, ...sSmart } : defaultSmartScene,
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

    // 3) Apply theme preference
    applyThemePreference(get().settings.themePreference)
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const { settings } = get()
      if (settings.themePreference === 'system') {
        applyThemePreference('system')
      }
    })

    // 4) Register global shortcuts
    await registerAllShortcuts()

    // 5) Start smart-scene loop if needed
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
      }
    })

    // 6) Listen for prevention toggled from Rust side (tray menu toggle)
    //    When user clicks "暂停/开始防锁屏" in the tray context menu,
    //    Rust toggles the caffeinate process and emits this event.
    //    Frontend must sync its state accordingly.
    await listen<boolean>('antisleep://prevention-toggled', (event) => {
      const isActive = event.payload
      const { prevention } = get()
      if (isActive && !prevention.active) {
        // Rust started prevention — sync frontend state
        set({
          prevention: {
            ...prevention,
            active: true,
            startTime: Date.now(),
            assertionId: -1, // Unknown PID from Rust side; will be overwritten on next frontend toggle
          },
        })
      } else if (!isActive && prevention.active) {
        // Rust stopped prevention — sync frontend state
        set({
          prevention: {
            ...defaultPrevention,
            mode: prevention.mode,
            duration: prevention.duration,
          },
        })
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
    const clamped = Math.max(0, Math.min(100, opacity))
    const next = { ...get().wallpaper, opacity: clamped }
    set({ wallpaper: next })
    sync(K_WALLPAPER, next)
  },

  setWallpaperBlur: (blur) => {
    const clamped = Math.max(0, Math.min(50, blur))
    const next = { ...get().wallpaper, blur: clamped }
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
    const clamped = Math.max(0, Math.min(100, opacity))
    const next = { ...get().theme, opacity: clamped }
    set({ theme: next }); sync(K_THEME, next)
  },
  setThemeSpeed: (speed) => {
    const clamped = Math.max(0.1, Math.min(3.0, speed))
    const next = { ...get().theme, speed: clamped }
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
  setClockStyle: (style) => {
    const next = { ...get().theme, clockStyle: style }
    set({ theme: next }); sync(K_THEME, next)
  },
  resetToFactory: async () => {
    // Clear all persisted data
    await Promise.all([
      persistRemove(K_SETTINGS),
      persistRemove(K_WALLPAPER),
      persistRemove(K_THEME),
      persistRemove(K_MARQUEE),
      persistRemove(K_SMART),
    ])
    // Reset state to defaults
    set({
      settings: defaultSettings,
      wallpaper: defaultWallpaper,
      theme: defaultTheme,
      marquee: defaultMarquee,
      smartScene: defaultSmartScene,
      prevention: defaultPrevention,
    })
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
  setMarqueeAnimation: (animation) => {
    const next = { ...get().marquee, animation }
    set({ marquee: next }); sync(K_MARQUEE, next)
  },
  setMarqueeDisplayStrategy: (displayStrategy) => {
    const next = { ...get().marquee, displayStrategy }
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
  toggleMarqueeItemEnabled: (id) => {
    const next = {
      ...get().marquee,
      items: get().marquee.items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }
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
  setMinimizeToTray: (enabled) => {
    const next = { ...get().settings, minimizeToTray: enabled }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  setExpiryWarning: (enabled) => {
    const next = { ...get().settings, expiryWarning: enabled }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  setExpiryWarningMinutes: (minutes) => {
    const next = { ...get().settings, expiryWarningMinutes: minutes }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  setSoundEnabled: (enabled) => {
    const next = { ...get().settings, soundEnabled: enabled }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  setLanguage: (language) => {
    const next = { ...get().settings, language }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  setPollIntervalSeconds: (seconds) => {
    const clamped = Math.max(5, Math.min(60, seconds))
    const next = { ...get().settings, pollIntervalSeconds: clamped }
    set({ settings: next }); sync(K_SETTINGS, next)
    // Restart smart scene loop with new interval
    if (smartSceneTimer) {
      clearInterval(smartSceneTimer)
      smartSceneTimer = null
    }
    ensureSmartSceneLoop()
  },
  setThemePreference: (themePreference) => {
    const next = { ...get().settings, themePreference }
    set({ settings: next }); sync(K_SETTINGS, next)
    applyThemePreference(themePreference)
  },
  setIdleScreensaverMinutes: (minutes) => {
    const next = { ...get().settings, idleScreensaverMinutes: Math.max(0, Math.min(120, minutes)) }
    set({ settings: next }); sync(K_SETTINGS, next)
  },
  completeOnboarding: () => {
    const next = { ...get().settings, onboardingCompleted: true }
    set({ settings: next }); sync(K_SETTINGS, next)
  },

  // UI
  setTrayPanelOpen: (open) => set({ trayPanelOpen: open }),
  setScreensaverVisible: (visible) => set({ screensaverVisible: visible }),
}))

// Suppress unused-import warning in non-Tauri builds
void getRemainingTime
