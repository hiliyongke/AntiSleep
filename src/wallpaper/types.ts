import type { WallpaperSource } from '../types'
import { convertFileSrc } from '@tauri-apps/api/core'

export type { WallpaperSource }

/** Built-in wallpaper paths (relative to assets) */
export const BUILT_IN_WALLPAPERS: WallpaperSource[] = [
  { id: 'built-in-black', type: 'built-in', name: '纯黑', path: '' },
  { id: 'built-in-deep-space', type: 'built-in', name: '深空星云', path: 'gradient:deep-space' },
  { id: 'built-in-forest', type: 'built-in', name: '暗夜森林', path: 'gradient:forest' },
  { id: 'built-in-cyber', type: 'built-in', name: '赛博城市', path: 'gradient:cyber' },
  { id: 'built-in-gradient', type: 'built-in', name: '渐变深渊', path: 'gradient:abyss' },
]

/** Built-in gradient presets — used when path starts with "gradient:" */
export const BUILT_IN_GRADIENTS: Record<string, string> = {
  'gradient:deep-space':
    'radial-gradient(ellipse at top, #1a1a3e 0%, #0d0d1f 40%, #000000 100%)',
  'gradient:forest':
    'radial-gradient(ellipse at bottom, #0f3d2e 0%, #071a14 50%, #000000 100%)',
  'gradient:cyber':
    'linear-gradient(135deg, #2a0845 0%, #6441a5 50%, #0f0c29 100%)',
  'gradient:abyss':
    'linear-gradient(180deg, #000428 0%, #004e92 50%, #000000 100%)',
}

/** Check if wallpaper source is a built-in gradient */
export function isGradientWallpaper(source: WallpaperSource | null): boolean {
  if (!source) return false
  return source.path.startsWith('gradient:')
}

/** Get gradient CSS for a built-in wallpaper */
export function getGradientCss(source: WallpaperSource | null): string {
  if (!source) return '#000000'
  return BUILT_IN_GRADIENTS[source.path] ?? '#000000'
}

/** Check if wallpaper source is a video */
export function isVideoWallpaper(source: WallpaperSource | null): boolean {
  if (!source) return false
  if (source.type === 'video') return true
  return /\.(mp4|webm)$/i.test(source.path)
}

/** Get wallpaper display URL — supports Tauri asset protocol via convertFileSrc */
export function getWallpaperUrl(source: WallpaperSource | null): string {
  if (!source || source.id === 'built-in-black') return ''
  if (source.path.startsWith('gradient:')) return ''
  if (source.path.startsWith('http')) return source.path
  // Tauri v2: convertFileSrc transparently produces the right URL per platform:
  //   macOS / Linux → asset://localhost/<encoded>
  //   Windows       → https://asset.localhost/<encoded>
  try {
    return convertFileSrc(source.path)
  } catch {
    return source.path
  }
}
