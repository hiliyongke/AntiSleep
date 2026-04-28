import type { WallpaperSource } from '../types'

export type { WallpaperSource }

/** Built-in wallpaper paths (relative to assets) */
export const BUILT_IN_WALLPAPERS: WallpaperSource[] = [
  { id: 'built-in-black', type: 'built-in', name: '纯黑', path: '' },
  { id: 'built-in-deep-space', type: 'built-in', name: '深空星云', path: '/wallpapers/deep-space.jpg' },
  { id: 'built-in-forest', type: 'built-in', name: '暗夜森林', path: '/wallpapers/forest.jpg' },
  { id: 'built-in-cyber', type: 'built-in', name: '赛博城市', path: '/wallpapers/cyber.jpg' },
  { id: 'built-in-gradient', type: 'built-in', name: '渐变深渊', path: '/wallpapers/gradient.jpg' },
]

/** Check if wallpaper source is a video */
export function isVideoWallpaper(source: WallpaperSource | null): boolean {
  if (!source) return false
  if (source.type === 'video') return true
  return /\.(mp4|webm)$/i.test(source.path)
}

/** Get wallpaper display URL (for Tauri asset protocol) */
export function getWallpaperUrl(source: WallpaperSource | null): string {
  if (!source || source.id === 'built-in-black') return ''
  if (source.path.startsWith('http')) return source.path
  // Use Tauri asset protocol for local files
  return `asset://localhost/${encodeURIComponent(source.path)}`
}
