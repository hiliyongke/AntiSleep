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
} from '../lib/tauri-commands'

// Simple hash for PIN/gesture (client-side, not crypto-grade)
async function hashSecret(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input + 'antisleep-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

  // Actions
  initApp: () => void
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
    { id: 'built-in-deep-space', type: 'built-in', name: '深空星云', path: '/wallpapers/deep-space.jpg' },
    { id: 'built-in-forest', type: 'built-in', name: '暗夜森林', path: '/wallpapers/forest.jpg' },
    { id: 'built-in-cyber', type: 'built-in', name: '赛博城市', path: '/wallpapers/cyber.jpg' },
    { id: 'built-in-gradient', type: 'built-in', name: '渐变深渊', path: '/wallpapers/gradient.jpg' },
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

  initApp: () => {
    // TODO: Load persisted settings from Tauri Store
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
  },

  setDuration: (duration) => {
    set({ prevention: { ...get().prevention, duration } })
  },

  // Wallpaper
  setWallpaper: (id) => {
    const { wallpaper } = get()
    const all = [...wallpaper.builtIn, ...wallpaper.custom]
    const found = all.find((w) => w.id === id)
    if (found) {
      set({ wallpaper: { ...wallpaper, current: found } })
    }
  },

  setWallpaperOpacity: (opacity) => {
    set({ wallpaper: { ...get().wallpaper, opacity } })
  },

  addCustomWallpaper: (path) => {
    const item: import('../types').WallpaperSource = {
      id: `custom-${Date.now()}`,
      type: path.match(/\.(mp4|webm)$/i) ? 'video' : 'image',
      name: path.split('/').pop() || path,
      path,
    }
    set({
      wallpaper: {
        ...get().wallpaper,
        custom: [...get().wallpaper.custom, item],
      },
    })
  },

  removeCustomWallpaper: (id) => {
    set({
      wallpaper: {
        ...get().wallpaper,
        custom: get().wallpaper.custom.filter((w) => w.id !== id),
      },
    })
  },

  // Theme
  setTheme: (themeId) => set({ theme: { ...get().theme, current: themeId } }),
  setThemeOpacity: (opacity) => set({ theme: { ...get().theme, opacity } }),
  setThemeSpeed: (speed) => set({ theme: { ...get().theme, speed } }),
  setThemeDensity: (density) => set({ theme: { ...get().theme, density } }),
  setThemeEnabled: (enabled) => set({ theme: { ...get().theme, enabled } }),
  setThemeCustomColor: (color) => set({ theme: { ...get().theme, customColor: color } }),

  // Marquee
  setMarqueeEnabled: (enabled) => set({ marquee: { ...get().marquee, enabled } }),
  setMarqueeMode: (mode) => set({ marquee: { ...get().marquee, mode } }),
  setMarqueeSpeed: (speed) => set({ marquee: { ...get().marquee, speed } }),
  setMarqueePosition: (position) => set({ marquee: { ...get().marquee, position } }),
  addMarqueeItem: (item) => set({ marquee: { ...get().marquee, items: [...get().marquee.items, item] } }),
  updateMarqueeItem: (id, updates) => {
    set({
      marquee: {
        ...get().marquee,
        items: get().marquee.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })
  },
  removeMarqueeItem: (id) => {
    set({
      marquee: {
        ...get().marquee,
        items: get().marquee.items.filter((item) => item.id !== id),
      },
    })
  },
  reorderMarqueeItems: (items) => set({ marquee: { ...get().marquee, items } }),

  // Smart scene
  setAutoOnCharge: (enabled) => set({ smartScene: { ...get().smartScene, autoOnCharge: enabled } }),
  setProcessNames: (names) => set({ smartScene: { ...get().smartScene, processNames: names } }),

  // Lock screen
  setLockEnabled: (enabled) => set({ lockScreen: { ...get().lockScreen, enabled } }),
  setLockType: (lockType) => set({ lockScreen: { ...get().lockScreen, lockType } }),
  setPinCode: async (pin: string) => {
    const pinHash = await hashSecret(pin)
    set({ lockScreen: { ...get().lockScreen, pinHash, enabled: true } })
  },
  setGesturePattern: async (pattern: string) => {
    const gestureHash = await hashSecret(pattern)
    set({ lockScreen: { ...get().lockScreen, gestureHash, enabled: true } })
  },
  setAutoLockDelay: (delay) => set({ lockScreen: { ...get().lockScreen, autoLockDelay: delay } }),
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
