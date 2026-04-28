import { open } from '@tauri-apps/plugin-dialog'
import { useAppStore } from '../../stores/appStore'
import {
  BUILT_IN_GRADIENTS,
  getWallpaperUrl,
  isGradientWallpaper,
  isVideoWallpaper,
} from '../../wallpaper/types'
import type { WallpaperSource } from '../../types'

function thumbBackground(wp: WallpaperSource): React.CSSProperties {
  if (wp.id === 'built-in-black') return { background: '#000' }
  if (isGradientWallpaper(wp)) return { background: BUILT_IN_GRADIENTS[wp.path] ?? '#000' }
  const url = getWallpaperUrl(wp)
  if (isVideoWallpaper(wp)) return { background: '#111' }
  return { background: `url(${url}) center/cover no-repeat, #111` }
}

export function WallpaperSettings() {
  const wallpaper = useAppStore((s) => s.wallpaper)
  const setWallpaper = useAppStore((s) => s.setWallpaper)
  const setWallpaperOpacity = useAppStore((s) => s.setWallpaperOpacity)
  const addCustomWallpaper = useAppStore((s) => s.addCustomWallpaper)
  const removeCustomWallpaper = useAppStore((s) => s.removeCustomWallpaper)

  const allWallpapers = [...wallpaper.builtIn, ...wallpaper.custom]

  const handleUpload = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Image or Video',
            extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'],
          },
        ],
      })
      if (typeof selected === 'string' && selected) {
        addCustomWallpaper(selected)
      }
    } catch (e) {
      console.error('[wallpaper] upload failed', e)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">壁纸设置</h2>

      {/* Wallpaper grid */}
      <div className="grid grid-cols-4 gap-3">
        {allWallpapers.map((wp) => {
          const isActive = wallpaper.current?.id === wp.id
          const isCustom = wp.id.startsWith('custom-')
          return (
            <div
              key={wp.id}
              className={`relative aspect-video rounded-md overflow-hidden group transition-all ${
                isActive
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-background-mica'
                  : 'hover:ring-1 hover:ring-border-fluent-hover'
              }`}
            >
              <button
                onClick={() => setWallpaper(wp.id)}
                className="w-full h-full flex items-end justify-start p-1.5 text-left"
                style={thumbBackground(wp)}
              >
                <span className="text-[10px] text-white/90 px-1 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                  {wp.name}
                </span>
              </button>
              {isActive && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center pointer-events-none">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
              {isCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeCustomWallpaper(wp.id) }}
                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/50 hover:bg-functional-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除此壁纸"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          )
        })}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          className="aspect-video rounded-md border-2 border-dashed border-border-fluent hover:border-accent/60 hover:bg-accent/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-[10px] text-text-tertiary">上传图片/视频</span>
        </button>
      </div>

      <div className="fluent-divider" />

      {/* Opacity slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-primary">壁纸透明度</p>
          <span className="text-xs text-text-tertiary">{wallpaper.opacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={wallpaper.opacity}
          onChange={(e) => setWallpaperOpacity(Number(e.target.value))}
          className="fluent-slider"
        />
      </div>
    </div>
  )
}
