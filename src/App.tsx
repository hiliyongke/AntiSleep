import { useEffect, useRef, useState } from 'react'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useAppStore } from './stores/appStore'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TrayPanel } from './components/tray/TrayPanel'
import { ScreensaverWindow } from './components/screensaver/ScreensaverWindow'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { useIdleScreensaver } from './hooks/useIdleScreensaver'
import { useSleepPrevention } from './hooks/useSleepPrevention'
import { Onboarding } from './components/onboarding/Onboarding'
import { getCurrentAppWindowLabel, openAppWindow, openScreensaver, stopScreensaverSession, syncScreensaverSession } from './lib/window'

function App() {
  const initApp = useAppStore((s) => s.initApp)
  const settings = useAppStore((s) => s.settings)
  const hydrated = useAppStore((s) => s._hydrated)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const onboardingOpenedRef = useRef(false)

  const [windowLabel, setWindowLabel] = useState<string>(() => getCurrentAppWindowLabel())

  useEffect(() => {
    initApp()
  }, [initApp])

  // Update window label after mount (handles async Tauri API)
  useEffect(() => {
    setWindowLabel(getCurrentAppWindowLabel())
  }, [])

  useEffect(() => {
    if (windowLabel !== 'main') return

    let unlistenOpen: UnlistenFn | null = null
    let unlistenStop: UnlistenFn | null = null

    window.__openScreensaver = () => openScreensaver()
    window.__stopScreensaverSession = async () => {
      stopScreensaverSession()
    }

    Promise.all([
      listen('antisleep://request-sync-screensaver-session', () => {
        syncScreensaverSession().catch(() => {})
      }),
      listen('antisleep://request-stop-screensaver-session', () => {
        stopScreensaverSession()
      }),
    ]).then(([openUnlisten, stopUnlisten]) => {
      unlistenOpen = openUnlisten
      unlistenStop = stopUnlisten
    }).catch(() => {})

    return () => {
      unlistenOpen?.()
      unlistenStop?.()
      delete window.__openScreensaver
      delete window.__stopScreensaverSession
    }
  }, [windowLabel])

  useSleepPrevention({ manageLifecycle: windowLabel === 'main' })

  // Auto-launch screensaver on idle from the hidden main window only.
  useIdleScreensaver(windowLabel === 'main')

  useEffect(() => {
    if (windowLabel !== 'main' || !hydrated || settings.onboardingCompleted || onboardingOpenedRef.current) {
      return
    }

    onboardingOpenedRef.current = true
    openAppWindow('settings').catch(() => {
      onboardingOpenedRef.current = false
    })
  }, [hydrated, settings.onboardingCompleted, windowLabel])

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
        {settings.onboardingCompleted ? (
          <SettingsPanel />
        ) : (
          <div className="w-screen h-screen" style={{ backgroundColor: 'var(--bg-mica)' }}>
            <Onboarding onComplete={completeOnboarding} />
          </div>
        )}
      </ErrorBoundary>
    )
  }

  return (
    <div className="w-screen h-screen bg-background-medium flex items-center justify-center">
      <div className="text-text-secondary text-sm">
        AntiSleep 正在系统托盘中运行
      </div>
    </div>
  )
}

export default App
