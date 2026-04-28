import { useAppStore } from '../../stores/appStore'
import { BUILT_IN_WALLPAPERS } from '../../wallpaper/types'

export function WallpaperSettings() {
  const wallpaper = useAppStore((s) => s.wallpaper)
  const setWallpaper = useAppStore((s) => s.setWallpaper)
  const setWallpaperOpacity = useAppStore((s) => s.setWallpaperOpacity)

  const allWallpapers = [...wallpaper.builtIn, ...wallpaper.custom]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">壁纸设置</h2>

      {/* Wallpaper grid */}
      <div className="grid grid-cols-4 gap-3">
        {allWallpapers.map((wp) => {
          const isActive = wallpaper.current?.id === wp.id
          return (
            <button
              key={wp.id}
              onClick={() => setWallpaper(wp.id)}
              className={`relative aspect-video rounded-md overflow-hidden transition-all ${
                isActive
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-background-mica'
                  : 'hover:ring-1 hover:ring-border-fluent-hover'
              }`}
            >
              <div className="w-full h-full bg-background-light flex items-center justify-center">
                <span className="text-xs text-text-tertiary">{wp.name}</span>
              </div>
              {isActive && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}

        {/* Upload placeholder */}
        <div className="aspect-video rounded-md border-2 border-dashed border-border-fluent hover:border-accent/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-[10px] text-text-tertiary">上传</span>
        </div>
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
