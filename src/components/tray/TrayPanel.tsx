import { useAppStore } from '../../stores/appStore'
import { useSleepPrevention } from '../../hooks/useSleepPrevention'
import { StatusIndicator } from './StatusIndicator'
import { ToggleButton } from './ToggleButton'
import { DurationSelector } from './DurationSelector'
import { ThemePreviewGrid } from './ThemePreviewGrid'
import { MarqueePreview } from './MarqueePreview'
import { closeCurrentAppWindow, openAppWindow } from '../../lib/window'
import { Settings, Monitor, X } from 'lucide-react'

export function TrayPanel() {
  const marquee = useAppStore((s) => s.marquee)
  const { prevention, togglePrevention, getRemainingTimeText, getStatusColor, isExpiringSoon } = useSleepPrevention()

  const handleSettings = async () => {
    openAppWindow('settings').catch((err) => console.error('[TrayPanel] open settings failed:', err))
  }

  const handleScreensaver = () => {
    openAppWindow('screensaver').catch((err) => console.error('[TrayPanel] open screensaver failed:', err))
  }

  const handleClose = () => {
    closeCurrentAppWindow().catch((err) => console.error('[TrayPanel] close failed:', err))
  }

  return (
    <div className="w-[380px] h-[480px] acrylic rounded-lg flex flex-col overflow-hidden">
      {/* Status */}
      <div className="px-5 pt-5 pb-3">
        <StatusIndicator
          active={prevention.active}
          statusColor={getStatusColor()}
          remainingText={getRemainingTimeText()}
          expiringSoon={isExpiringSoon()}
        />
      </div>

      {/* Toggle button */}
      <div className="px-5 pb-3">
        <ToggleButton
          active={prevention.active}
          onToggle={togglePrevention}
        />
      </div>

      {/* Duration selector */}
      <div className="px-5 pb-3">
        <DurationSelector />
      </div>

      {/* Theme grid */}
      <div className="px-5 pb-3 flex-1 min-h-0">
        <ThemePreviewGrid />
      </div>

      {/* Marquee preview */}
      {marquee.items.length > 0 && (
        <div className="px-5 pb-2">
          <MarqueePreview />
        </div>
      )}

      {/* Bottom action bar */}
      <div className="px-5 pb-4 pt-1 flex items-center justify-center gap-6">
        <button
          onClick={handleSettings}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <Settings size={18} />
          <span className="text-[10px]">设置</span>
        </button>
        <button
          onClick={handleScreensaver}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <Monitor size={18} />
          <span className="text-[10px]">屏保</span>
        </button>
        <button
          onClick={handleClose}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D13438')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <X size={18} />
          <span className="text-[10px]">收起</span>
        </button>
      </div>
    </div>
  )
}
