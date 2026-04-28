import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useAppStore } from './stores/appStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TrayPanel } from './components/tray/TrayPanel'
import { ScreensaverWindow } from './components/screensaver/ScreensaverWindow'
import { SettingsPanel } from './components/settings/SettingsPanel'

/**
 * Resolve current window label following Tauri v2 best practice.
 *
 * Priority:
 *   1. `getCurrentWindow().label` — 官方推荐，每个 Webview 原生携带 label（见
 *      @tauri-apps/api/window）。这是 Tauri v2 区分多窗口的规范方式。
 *   2. URL query `?label=xxx` — 仅用于纯浏览器调试（`npm run dev` 直接访问 5173）。
 *   3. 默认 'main'。
 *
 * 之前仅依赖 `window.location.search` 会在 Tauri 下失败：Rust 端 `WebviewUrl::App`
 * 传入带 query 的相对路径时，query 在 WKWebView/tauri:// 自定义协议下会被 normalize
 * 或丢弃，导致 settings / screensaver 窗口误落回 'main' 分支并渲染占位 UI
 * （深灰底 + 半透明白色小字，视觉上几乎是纯黑）。
 */
function useWindowLabel(): string {
  const [label, setLabel] = useState<string>(() => {
    if (typeof window === 'undefined') return 'main'
    return new URLSearchParams(window.location.search).get('label') || 'main'
  })

  useEffect(() => {
    let cancelled = false
    try {
      const tauriLabel = getCurrentWindow().label
      if (tauriLabel && !cancelled) {
        setLabel(tauriLabel)
      }
    } catch {
      // 非 Tauri 环境（浏览器直接访问 vite dev），沿用 URL query 结果。
    }
    return () => {
      cancelled = true
    }
  }, [])

  return label
}

function App() {
  const initApp = useAppStore((s) => s.initApp)

  useEffect(() => {
    initApp()
  }, [initApp])

  const windowLabel = useWindowLabel()

  if (windowLabel === 'tray-panel') {
    return (
      <ErrorBoundary>
        <TrayPanel />
      </ErrorBoundary>
    )
  }

  if (windowLabel === 'screensaver') {
    return (
      <ErrorBoundary>
        <ScreensaverWindow />
      </ErrorBoundary>
    )
  }

  if (windowLabel === 'settings') {
    return (
      <ErrorBoundary>
        <SettingsPanel />
      </ErrorBoundary>
    )
  }

  // Main window (hidden, just for tray management)
  return (
    <div className="w-screen h-screen bg-background-medium flex items-center justify-center">
      <div className="text-text-secondary text-sm">
        AntiSleep is running in the system tray
      </div>
    </div>
  )
}

export default App
