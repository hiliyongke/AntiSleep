import { useAppStore } from '../../stores/appStore'
import { useSleepPrevention } from '../../hooks/useSleepPrevention'
import { StatusIndicator } from './StatusIndicator'
import { ToggleButton } from './ToggleButton'
import { DurationSelector } from './DurationSelector'
import { ThemePreviewGrid } from './ThemePreviewGrid'
import { MarqueePreview } from './MarqueePreview'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Settings, Monitor, X } from 'lucide-react'

/**
 * 打开或聚焦一个已命名窗口。
 * - 已存在：show() + setFocus()
 * - 不存在：new WebviewWindow(label, options) 创建
 *
 * 这是 Tauri v2 打开/复用窗口的规范做法（@tauri-apps/api/webviewWindow）。
 * 注意 url 用相对路径 "index.html"，窗口身份完全由 label 承载，
 * 前端通过 getCurrentWindow().label 读取。
 */
async function openOrFocusWindow(
  label: string,
  options: ConstructorParameters<typeof WebviewWindow>[1],
) {
  const existing = await WebviewWindow.getByLabel(label)
  if (existing) {
    await existing.show()
    await existing.setFocus()
    return
  }
  const webview = new WebviewWindow(label, { url: 'index.html', ...options })
  webview.once('tauri://error', (e) => {
    console.error(`[TrayPanel] failed to create window "${label}":`, e)
  })
}

export function TrayPanel() {
  const marquee = useAppStore((s) => s.marquee)
  const { prevention, togglePrevention, getRemainingTimeText, getStatusColor, isExpiringSoon } = useSleepPrevention()

  const handleSettings = async () => {
    const isDark = document.documentElement.classList.contains('dark')
    const { currentMonitor } = await import('@tauri-apps/api/window')
    const monitor = await currentMonitor()
    const scaleFactor = monitor?.scaleFactor ?? 1
    const screenWidth = (monitor?.size.width ?? 1920) / scaleFactor
    const screenHeight = (monitor?.size.height ?? 1080) / scaleFactor
    openOrFocusWindow('settings', {
      title: 'AntiSleep Settings',
      width: Math.round(screenWidth * 0.8),
      height: Math.round(screenHeight * 0.8),
      minWidth: Math.round(screenWidth * 0.56),
      minHeight: 600,
      resizable: true,
      decorations: true,
      center: true,
      backgroundColor: isDark ? '#202020' : '#F9F9F9',
    }).catch((err) => console.error('[TrayPanel] open settings failed:', err))
  }

  const handleScreensaver = () => {
    openOrFocusWindow('screensaver', {
      title: 'AntiSleep Screensaver',
      fullscreen: true,
      resizable: false,
      decorations: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      backgroundColor: '#000000',
    }).catch((err) => console.error('[TrayPanel] open screensaver failed:', err))
  }

  const handleClose = () => {
    getCurrentWindow()
      .close()
      .catch((err) => console.error('[TrayPanel] close failed:', err))
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
          <span className="text-[10px]">关闭</span>
        </button>
      </div>
    </div>
  )
}
