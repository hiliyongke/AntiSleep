// Prevention modes
export type PreventionMode = 'display' | 'system'

// Prevention duration options
export type DurationOption = 30 | 60 | 120 | null // minutes, null = infinite

// Marquee scroll modes
export type MarqueeMode = 'horizontal' | 'vertical' | 'fade'

// Marquee speed presets
export type MarqueeSpeed = 'slow' | 'medium' | 'fast'

// Marquee position
export type MarqueePosition = 'top' | 'center-bottom' | 'bottom'

// Particle density
export type ParticleDensity = 'low' | 'medium' | 'high'

// Theme categories
export type ThemeCategory = 'tech' | 'nature' | 'minimal'

// Theme IDs
export type ThemeId = 'matrix' | 'particle-network' | 'starfield' | 'aurora' | 'breathing-light' | 'clock'

// Lock screen types
export type LockType = 'pin' | 'gesture' | 'none'

// Prevention state
export interface PreventionState {
  active: boolean
  mode: PreventionMode
  duration: DurationOption
  startTime: number | null
  assertionId: number | null
}

// Wallpaper types
export type WallpaperType = 'image' | 'video' | 'built-in' | 'none'

export interface WallpaperSource {
  id: string
  type: WallpaperType
  name: string
  path: string
  thumbnail?: string
}

export interface WallpaperState {
  current: WallpaperSource | null
  opacity: number
  builtIn: WallpaperSource[]
  custom: WallpaperSource[]
}

// Theme state
export interface ThemeState {
  current: ThemeId
  opacity: number
  speed: number
  density: ParticleDensity
  enabled: boolean
  customColor: string
}

// Marquee item
export interface MarqueeItem {
  id: string
  content: string
  fontSize: number
  color: string
  glowEnabled: boolean
  glowColor: string
  glowIntensity: number
}

export interface MarqueeState {
  enabled: boolean
  items: MarqueeItem[]
  mode: MarqueeMode
  speed: MarqueeSpeed
  position: MarqueePosition
}

// Smart scene
export interface SmartSceneState {
  autoOnCharge: boolean
  processNames: string[]
}

// Theme config for renderers
export interface ThemeConfig {
  speed: number
  density: ParticleDensity
  customColor: string
  opacity: number
}

// Lock screen state
export interface LockScreenState {
  enabled: boolean
  lockType: LockType
  pinHash: string | null
  gestureHash: string | null
  autoLockDelay: number // seconds before auto-lock (0 = instant)
  locked: boolean
  failedAttempts: number
  lastFailedTime: number | null
}

// App settings
export interface AppSettings {
  autoStart: boolean
  defaultMode: PreventionMode
  defaultDuration: DurationOption
  shortcutEnable: string
  shortcutDisable: string
  shortcutScreensaver: string
}

// Theme meta for registry
export interface ThemeMeta {
  id: ThemeId
  name: string
  category: ThemeCategory
  thumbnail: string
  defaultColor: string
}
