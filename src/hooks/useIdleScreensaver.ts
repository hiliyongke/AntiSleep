import { useEffect, useRef } from 'react'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useAppStore } from '../stores/appStore'
import { openScreensaver } from '../lib/window'

/**
 * Monitors user idle time and auto-launches the screensaver
 * when the configured idle threshold is reached.
 *
 * Idle detection: tracks last mouse/keyboard activity timestamp.
 * Polls every 10s to check if idle threshold exceeded.
 */
export function useIdleScreensaver(enabled: boolean) {
  const idleScreensaverMinutes = useAppStore((s) => s.settings.idleScreensaverMinutes)
  const lastActivityRef = useRef(Date.now())
  const openWindowLabelsRef = useRef(new Set<string>())
  const screensaverOpenRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Update last activity on any user input
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const
    for (const evt of events) {
      window.addEventListener(evt, updateActivity, { passive: true })
    }
    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, updateActivity)
      }
    }
  }, [])

  useEffect(() => {
    let unlistenOpened: UnlistenFn | null = null
    let unlistenClosed: UnlistenFn | null = null

    Promise.all([
      listen<{ label?: string }>('antisleep://screensaver-opened', (event) => {
        const label = event.payload?.label ?? 'screensaver'
        openWindowLabelsRef.current.add(label)
        screensaverOpenRef.current = openWindowLabelsRef.current.size > 0
      }),
      listen<{ label?: string }>('antisleep://screensaver-closed', (event) => {
        const label = event.payload?.label ?? 'screensaver'
        openWindowLabelsRef.current.delete(label)
        screensaverOpenRef.current = openWindowLabelsRef.current.size > 0
        if (!screensaverOpenRef.current) {
          lastActivityRef.current = Date.now()
        }
      }),
    ])
      .then(([opened, closed]) => {
        unlistenOpened = opened
        unlistenClosed = closed
      })
      .catch(() => {})

    return () => {
      unlistenOpened?.()
      unlistenClosed?.()
    }
  }, [])

  // Poll idle time and auto-launch screensaver
  useEffect(() => {
    if (!enabled || !idleScreensaverMinutes || idleScreensaverMinutes <= 0) return

    const checkIdle = () => {
      if (screensaverOpenRef.current) return

      const idleMs = Date.now() - lastActivityRef.current
      const thresholdMs = idleScreensaverMinutes * 60 * 1000
      if (idleMs >= thresholdMs) {
        screensaverOpenRef.current = true
        lastActivityRef.current = Date.now()
        openScreensaver().catch(() => {
          screensaverOpenRef.current = false
          openWindowLabelsRef.current.clear()
        })
      }
    }

    timerRef.current = setInterval(checkIdle, 10_000) // check every 10s
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [enabled, idleScreensaverMinutes])
}
