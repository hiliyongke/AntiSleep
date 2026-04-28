import { useAppStore } from '../../stores/appStore'
import { getThemeMetaList } from '../../themes/registry'
import type { ThemeId } from '../../types'

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

const THEME_ICONS: Record<ThemeId, string> = {
  'matrix': '⌨️',
  'particle-network': '🔮',
  'starfield': '✨',
  'aurora': '🌈',
  'breathing-light': '💡',
  'clock': '🕐',
  'fireflies': '🪲',
  'wave-fluid': '🌊',
  'neon-geo': '🔷',
}

export function ThemePreviewGrid() {
  const currentTheme = useAppStore((s) => s.theme.current)
  const setTheme = useAppStore((s) => s.setTheme)
  const themes = getThemeMetaList()

  return (
    <div className="grid grid-cols-3 gap-2">
      {themes.map((theme) => {
        const isActive = currentTheme === theme.id
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200 border ${
              isActive
                ? 'bg-accent/15 border-accent/40'
                : 'border-transparent hover:border-[var(--border-fluent-hover)]'
            }`}
            style={isActive ? {} : { backgroundColor: 'var(--bg-subtle)' }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-lighter)' }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
          >
            {/* Mini preview swatch */}
            <div
              className="w-10 h-10 rounded-md mb-1 flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${THEME_COLORS[theme.id]}33, ${THEME_COLORS[theme.id]}11)`
                  : 'rgba(255,255,255,0.03)',
                boxShadow: isActive ? `0 0 12px ${THEME_COLORS[theme.id]}33` : 'none',
              }}
            >
              {THEME_ICONS[theme.id]}
            </div>
            <span className={`text-[10px] leading-tight ${isActive ? '' : ''}`} style={isActive ? { color: 'var(--text-primary)' } : { color: 'var(--text-secondary)' }}>
              {theme.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
