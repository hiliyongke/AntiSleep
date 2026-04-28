// Prevention modes
export type PreventionMode = 'display' | 'system'

// Prevention duration options
export type DurationOption = 30 | 60 | 120 | null // minutes, null = infinite

// Marquee scroll modes
export type MarqueeMode = 'horizontal' | 'vertical' | 'fade' | 'static' | 'typewriter'

// Marquee speed presets
export type MarqueeSpeed = 'slow' | 'medium' | 'fast'

// Marquee position
export type MarqueePosition = 'top' | 'center' | 'center-bottom' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// Text animation type
export type TextAnimation = 'none' | 'pulse' | 'bounce' | 'float' | 'glow-pulse' | 'shake'

// Particle density
export type ParticleDensity = 'low' | 'medium' | 'high'

// Theme categories
export type ThemeCategory = 'tech' | 'nature' | 'minimal'

// Theme IDs
export type ThemeId = 'matrix' | 'particle-network' | 'starfield' | 'aurora' | 'breathing-light' | 'clock' | 'fireflies' | 'wave-fluid' | 'neon-geo'

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
  blur: number
  builtIn: WallpaperSource[]
  custom: WallpaperSource[]
}

// Clock style
export type ClockStyle = 'analog' | 'digital'

// Theme state
export interface ThemeState {
  current: ThemeId
  opacity: number
  speed: number
  density: ParticleDensity
  enabled: boolean
  customColor: string
  clockStyle: ClockStyle
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
  // Per-item animation override
  animation?: TextAnimation
  // Per-item position override (optional)
  position?: MarqueePosition
  // Whether this item is enabled
  enabled: boolean
}

export interface MarqueeState {
  enabled: boolean
  items: MarqueeItem[]
  mode: MarqueeMode
  speed: MarqueeSpeed
  position: MarqueePosition
  // Global animation applied to all items unless overridden
  animation: TextAnimation
  // Display strategy
  displayStrategy: 'single' | 'cycle' | 'all'
}

// Smart scene
export interface SmartSceneState {
  autoOnCharge: boolean
  processNames: string[]
}

// Process info (from Rust backend)
export interface ProcessInfo {
  pid: number
  name: string
  cpuUsage: number
  memoryBytes: number
}

// Theme config for renderers
export interface ThemeConfig {
  speed: number
  density: ParticleDensity
  customColor: string
  opacity: number
}

// Theme preference for dark/light mode
export type ThemePreference = 'dark' | 'light' | 'system'

// App settings
export interface AppSettings {
  autoStart: boolean
  defaultMode: PreventionMode
  defaultDuration: DurationOption
  shortcutEnable: string
  shortcutDisable: string
  shortcutScreensaver: string
  // Enhanced settings
  minimizeToTray: boolean
  expiryWarning: boolean
  expiryWarningMinutes: number
  soundEnabled: boolean
  language: 'zh-CN' | 'en-US'
  pollIntervalSeconds: number
  // Theme preference
  themePreference: ThemePreference
  // Idle screensaver auto-launch (0 = disabled)
  idleScreensaverMinutes: number
  // Onboarding completed
  onboardingCompleted: boolean
}

// Theme meta for registry
export interface ThemeMeta {
  id: ThemeId
  name: string
  category: ThemeCategory
  thumbnail: string
  defaultColor: string
}
