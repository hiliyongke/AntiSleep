// Prevention modes
export type PreventionMode = 'display' | 'system'

// Prevention duration options
export type DurationOption = 30 | 60 | 120 | null // minutes, null = infinite

// Marquee scroll modes
export type MarqueeMode = 'horizontal' | 'vertical' | 'fade' | 'static' | 'typewriter'

// Marquee text transform
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

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
export type ThemeId = 'matrix' | 'particle-network' | 'starfield' | 'breathing-light' | 'clock' | 'fireflies' | 'wave-fluid' | 'neon-geo' | 'aurora'

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

// Clock size
export type ClockSize = 'small' | 'medium' | 'large' | 'xlarge'

// Clock position
export type ClockPosition = 'top' | 'center' | 'bottom'

// Theme state
export interface ThemeState {
  current: ThemeId
  opacity: number
  speed: number
  density: ParticleDensity
  enabled: boolean
  customColor: string
  clockStyle: ClockStyle
  clockSize: ClockSize
  clockPosition: ClockPosition
  // 自定义位置（屏幕百分比 0-100），同时设置时覆盖 clockPosition
  clockPositionX?: number
  clockPositionY?: number
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
  // Typography
  fontWeight?: number
  letterSpacing?: number
  lineHeight?: number
  textAlign?: 'left' | 'center' | 'right'
  textTransform?: TextTransform
  // Background card
  bgEnabled?: boolean
  bgColor?: string
  bgOpacity?: number
  borderRadius?: number
  paddingX?: number
  paddingY?: number
  // Per-item animation override
  animation?: TextAnimation
  // Per-item mode/speed override (optional, fallback to fixed defaults)
  mode?: MarqueeMode
  speed?: MarqueeSpeed
  // Per-item position override (optional)
  position?: MarqueePosition
  // 自定义位置（屏幕百分比 0-100），同时设置时覆盖 position
  positionX?: number
  positionY?: number
  // Whether this item is enabled
  enabled: boolean
}

export interface MarqueeState {
  enabled: boolean
  items: MarqueeItem[]
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
  clockSize?: ClockSize
  clockPosition?: ClockPosition
  // 自定义位置（屏幕百分比 0-100），同时设置时覆盖 clockPosition
  clockPositionX?: number
  clockPositionY?: number
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
  expiryWarning: boolean
  expiryWarningMinutes: number
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
