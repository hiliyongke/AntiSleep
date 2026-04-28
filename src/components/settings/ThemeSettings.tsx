import { useAppStore } from '../../stores/appStore'
import { getThemeMetaList } from '../../themes/registry'
import type { ThemeId, ParticleDensity } from '../../types'

const THEME_COLORS: Record<ThemeId, string> = {
  'matrix': '#16C60C',
  'particle-network': '#0078D4',
  'starfield': '#FFFFFF',
  'aurora': '#16C60C',
  'breathing-light': '#D83B01',
  'clock': '#FFFFFF',
}

const THEME_ICONS: Record<ThemeId, string> = {
  'matrix': '⌨️',
  'particle-network': '🔮',
  'starfield': '✨',
  'aurora': '🌈',
  'breathing-light': '💡',
  'clock': '🕐',
}

export function ThemeSettings() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const setThemeEnabled = useAppStore((s) => s.setThemeEnabled)
  const setThemeOpacity = useAppStore((s) => s.setThemeOpacity)
  const setThemeSpeed = useAppStore((s) => s.setThemeSpeed)
  const setThemeDensity = useAppStore((s) => s.setThemeDensity)
  const setThemeCustomColor = useAppStore((s) => s.setThemeCustomColor)

  const themes = getThemeMetaList()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">主题偏好</h2>
        <button
          onClick={() => setThemeEnabled(!theme.enabled)}
          className={`fluent-toggle ${theme.enabled ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      {/* Theme selection grid */}
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const isActive = theme.current === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-md flex flex-col items-center gap-2 transition-all ${
                isActive
                  ? 'bg-accent/10 border border-accent/40'
                  : 'bg-background-subtle border border-transparent hover:border-border-fluent-hover'
              }`}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-lg"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLORS[t.id]}33, ${THEME_COLORS[t.id]}11)`,
                }}
              >
                {THEME_ICONS[t.id]}
              </div>
              <span className={`text-xs ${isActive ? 'text-accent' : 'text-text-secondary'}`}>
                {t.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="fluent-divider" />

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-primary">特效透明度</p>
          <span className="text-xs text-text-tertiary">{theme.opacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={theme.opacity}
          onChange={(e) => setThemeOpacity(Number(e.target.value))}
          className="fluent-slider"
        />
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-primary">动画速度</p>
          <span className="text-xs text-text-tertiary">{theme.speed.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={theme.speed}
          onChange={(e) => setThemeSpeed(Number(e.target.value))}
          className="fluent-slider"
        />
      </div>

      {/* Density */}
      <div className="space-y-2">
        <p className="text-sm text-text-primary">粒子密度</p>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as ParticleDensity[]).map((d) => (
            <button
              key={d}
              onClick={() => setThemeDensity(d)}
              className={`capsule flex-1 text-center ${
                theme.density === d ? 'capsule-active' : 'capsule-inactive'
              }`}
            >
              {d === 'low' ? '低' : d === 'medium' ? '中' : '高'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom color */}
      <div className="space-y-2">
        <p className="text-sm text-text-primary">自定义主色</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={theme.customColor}
            onChange={(e) => setThemeCustomColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border-fluent bg-transparent"
          />
          <span className="text-xs text-text-tertiary">{theme.customColor}</span>
        </div>
      </div>
    </div>
  )
}
