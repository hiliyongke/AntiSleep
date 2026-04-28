import { useAppStore } from '../../stores/appStore'
import {
  getWallpaperUrl,
  isVideoWallpaper,
  isGradientWallpaper,
  getGradientCss,
} from '../../wallpaper/types'

export function WallpaperLayer() {
  const wallpaper = useAppStore((s) => s.wallpaper)
  const source = wallpaper.current
  const opacity = wallpaper.opacity / 100

  if (!source || source.id === 'built-in-black') {
    return <div className="absolute inset-0 z-10 bg-black" />
  }

  // Built-in gradient presets
  if (isGradientWallpaper(source)) {
    return (
      <div
        className="absolute inset-0 z-10"
        style={{ opacity, background: getGradientCss(source) }}
      />
    )
  }

  const url = getWallpaperUrl(source)

  if (isVideoWallpaper(source)) {
    return (
      <div className="absolute inset-0 z-10" style={{ opacity }}>
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-10" style={{ opacity }}>
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  )
}
