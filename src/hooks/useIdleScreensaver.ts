import { useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { openAppWindow } from '../lib/window'

/**
 * Monitors user idle time and auto-launches the screensaver
 * when the configured idle threshold is reached.
 *
 * Idle detection: tracks last mouse/keyboard activity timestamp.
 * Polls every 10s to check if idle threshold exceeded.
 */
export function useIdleScreensaver() {
  const idleScreensaverMinutes = useAppStore((s) => s.settings.idleScreensaverMinutes)
  const screensaverVisible = useAppStore((s) => s.screensaverVisible)
  const lastActivityRef = useRef(Date.now())
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

  // Poll idle time and auto-launch screensaver
  useEffect(() => {
    if (!idleScreensaverMinutes || idleScreensaverMinutes <= 0) return
    if (screensaverVisible) return

    const checkIdle = () => {
      if (useAppStore.getState().screensaverVisible) return
      const idleMs = Date.now() - lastActivityRef.current
      const thresholdMs = idleScreensaverMinutes * 60 * 1000
      if (idleMs >= thresholdMs) {
        openAppWindow('screensaver').catch(() => {})
      }
    }

    timerRef.current = setInterval(checkIdle, 10_000) // check every 10s
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [idleScreensaverMinutes, screensaverVisible])
}
