import { useAppStore } from '../../stores/appStore'
import { useSleepPrevention } from '../../hooks/useSleepPrevention'
import { Palette, Image, ScrollText, X } from 'lucide-react'

interface FloatingControlsProps {
  visible: boolean
}

export function FloatingControls({ visible }: FloatingControlsProps) {
  const theme = useAppStore((s) => s.theme)
  const setThemeEnabled = useAppStore((s) => s.setThemeEnabled)
  const marquee = useAppStore((s) => s.marquee)
  const setMarqueeEnabled = useAppStore((s) => s.setMarqueeEnabled)
  const { getRemainingTimeText } = useSleepPrevention()

  const handleClose = () => {
    if (window.__TAURI__) {
      window.__TAURI__.core.invoke('plugin:window|close', { label: 'screensaver' }).catch(() => {
        window.close()
      })
    }
  }

  return (
    <div
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="acrylic-light rounded-full px-4 py-2.5 flex items-center gap-3">
        {/* Remaining time */}
        <div className="text-xs text-text-secondary tabular-nums pr-2 border-r border-border-fluent">
          {getRemainingTimeText() || '--:--'}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setThemeEnabled(!theme.enabled)}
          className={`p-1.5 rounded-md transition-colors ${
            theme.enabled ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title={theme.enabled ? '关闭特效' : '开启特效'}
        >
          <Palette size={16} />
        </button>

        {/* Marquee toggle */}
        <button
          onClick={() => setMarqueeEnabled(!marquee.enabled)}
          className={`p-1.5 rounded-md transition-colors ${
            marquee.enabled ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title={marquee.enabled ? '关闭跑马灯' : '开启跑马灯'}
        >
          <ScrollText size={16} />
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="p-1.5 rounded-md text-text-tertiary hover:text-functional-error transition-colors"
          title="关闭屏保"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
