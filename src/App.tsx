import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TrayPanel } from './components/tray/TrayPanel'
import { ScreensaverWindow } from './components/screensaver/ScreensaverWindow'
import { SettingsPanel } from './components/settings/SettingsPanel'

function App() {
  const initApp = useAppStore((s) => s.initApp)

  useEffect(() => {
    initApp()
  }, [initApp])

  // Determine which view to show based on window label
  const windowLabel = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('label') || 'main'
    : 'main'

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
