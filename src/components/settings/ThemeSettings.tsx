import { useAppStore } from '../../stores/appStore'
import { getThemeMetaList } from '../../themes/registry'
import type { ThemeId, ParticleDensity, ThemeCategory, ClockStyle } from '../../types'
import {
  Terminal,
  Network,
  Sparkles,
  Rainbow,
  Lightbulb,
  Clock,
  Bug,
  Waves,
  Hexagon,
} from 'lucide-react'

const THEME_COLORS: Record<ThemeId, string> = {
  'matrix': '#16C60C',
  'particle-network': '#0078D4',
  'starfield': '#FFFFFF',
  'aurora': '#16C60C',
  'breathing-light': '#D83B01',
  'clock': '#FFFFFF',
  'fireflies': '#FFD700',
  'wave-fluid': '#00D4AA',
  'neon-geo': '#FF006E',
}

const THEME_ICONS: Record<ThemeId, React.ComponentType<{ size?: number | string; color?: string }>> = {
  'matrix': Terminal,
  'particle-network': Network,
  'starfield': Sparkles,
  'aurora': Rainbow,
  'breathing-light': Lightbulb,
  'clock': Clock,
  'fireflies': Bug,
  'wave-fluid': Waves,
  'neon-geo': Hexagon,
}

const CATEGORY_LABELS: Record<ThemeCategory, string> = {
  tech: '科技风',
  nature: '自然风',
  minimal: '简约风',
}

export function ThemeSettings() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const setThemeEnabled = useAppStore((s) => s.setThemeEnabled)
  const setThemeOpacity = useAppStore((s) => s.setThemeOpacity)
  const setThemeSpeed = useAppStore((s) => s.setThemeSpeed)
  const setThemeDensity = useAppStore((s) => s.setThemeDensity)
  const setThemeCustomColor = useAppStore((s) => s.setThemeCustomColor)
  const setClockStyle = useAppStore((s) => s.setClockStyle)

  const themes = getThemeMetaList()

  // Group themes by category
  const categories: ThemeCategory[] = ['tech', 'nature', 'minimal']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>主题偏好</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeEnabled(!theme.enabled)}
            className={`fluent-toggle ${theme.enabled ? 'fluent-toggle-active' : ''}`}
          >
            <span className="fluent-toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Theme selection — grouped by category */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catThemes = themes.filter((t) => t.category === cat)
          return (
            <div key={cat} className="space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{CATEGORY_LABELS[cat]}</p>
              <div className="grid grid-cols-3 gap-2">
                {catThemes.map((t) => {
                  const isActive = theme.current === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-2.5 rounded-md flex flex-col items-center gap-1.5 transition-all border ${
                        isActive
                          ? 'bg-accent/10 border-accent/40'
                          : 'border-transparent hover:border-[var(--border-fluent-hover)]'
                      }`}
                      style={isActive ? {} : { backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-transform duration-200 ${
                          isActive ? 'scale-110' : ''
                        }`}
                        style={{
                          background: isActive
                            ? `linear-gradient(135deg, ${THEME_COLORS[t.id]}44, ${THEME_COLORS[t.id]}18)`
                            : `linear-gradient(135deg, ${THEME_COLORS[t.id]}22, ${THEME_COLORS[t.id]}0a)`,
                          boxShadow: isActive ? `0 0 12px ${THEME_COLORS[t.id]}33` : 'none',
                        }}
                      >
                        {(() => {
                          const Icon = THEME_ICONS[t.id]
                          return <Icon size={18} color={THEME_COLORS[t.id]} />
                        })()}
                      </div>
                      <span className={`text-[11px] leading-tight ${isActive ? 'text-accent font-medium' : ''}`} style={isActive ? {} : { color: 'var(--text-secondary)' }}>
                        {t.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Clock style switcher (only when clock theme is active) */}
      {theme.current === 'clock' && (
        <>
          <div className="fluent-divider" />
          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>时钟风格</p>
            <div className="flex gap-2">
              {([
                { value: 'analog' as ClockStyle, label: '模拟时钟', Icon: Clock },
                { value: 'digital' as ClockStyle, label: '数字时钟', Icon: Terminal },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setClockStyle(opt.value)}
                  className={`capsule flex-1 text-center flex items-center justify-center gap-1.5 ${
                    theme.clockStyle === opt.value ? 'capsule-active' : 'capsule-inactive'
                  }`}
                >
                  <opt.Icon size={14} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="fluent-divider" />

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>特效透明度</p>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{theme.opacity}%</span>
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
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>动画速度</p>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{theme.speed.toFixed(1)}x</span>
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
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>粒子密度</p>
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

      <div className="fluent-divider" />

      {/* Custom color */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>自定义主色</p>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{theme.customColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.customColor}
            onChange={(e) => setThemeCustomColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent"
            style={{ border: '1px solid var(--border-fluent)' }}
          />
          {/* Preset colors */}
          <div className="flex gap-1.5">
            {['#0078D4', '#16C60C', '#D83B01', '#FFFFFF', '#F7630C', '#B1464F'].map((color) => (
              <button
                key={color}
                onClick={() => setThemeCustomColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  theme.customColor.toUpperCase() === color.toUpperCase()
                    ? 'border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

