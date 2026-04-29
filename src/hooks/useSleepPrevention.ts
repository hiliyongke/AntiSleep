import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppStore } from '../stores/appStore'

interface UseSleepPreventionOptions {
  manageLifecycle?: boolean
}

/** Send a system notification (safe no-op in browser) */
function sendNotification(title: string, body: string) {
  if (typeof window === 'undefined') return
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification(title, { body })
      })
    }
  }
}

/**
 * Hook for managing sleep prevention state and countdown
 */
export function useSleepPrevention(options: UseSleepPreventionOptions = {}) {
  const { manageLifecycle = false } = options
  const prevention = useAppStore((s) => s.prevention)
  const settings = useAppStore((s) => s.settings)
  const togglePrevention = useAppStore((s) => s.togglePrevention)
  const startPreventionAction = useAppStore((s) => s.startPreventionAction)
  const stopPreventionAction = useAppStore((s) => s.stopPreventionAction)
  const setPreventionMode = useAppStore((s) => s.setPreventionMode)
  const setDuration = useAppStore((s) => s.setDuration)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningFiredRef = useRef(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!prevention.active) {
      setNow(Date.now())
      return
    }

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [prevention.active])

  // Auto-stop when duration expires + expiry warning
  useEffect(() => {
    if (!manageLifecycle) {
      return
    }

    // Reset warning flag when prevention starts
    if (prevention.active && prevention.startTime) {
      const elapsed = (Date.now() - prevention.startTime) / 1000
      if (elapsed < 2) {
        warningFiredRef.current = false
      }
    }

    if (!prevention.active || prevention.duration === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      warningFiredRef.current = false
      return
    }

    const checkExpiry = () => {
      if (!prevention.startTime) return
      const elapsed = (Date.now() - prevention.startTime) / 1000
      const totalSeconds = (prevention.duration ?? 0) * 60
      const remaining = totalSeconds - elapsed

      // Expiry warning notification
      if (settings.expiryWarning && !warningFiredRef.current && remaining > 0) {
        const warningSeconds = settings.expiryWarningMinutes * 60
        if (remaining <= warningSeconds) {
          warningFiredRef.current = true
          const mins = Math.ceil(remaining / 60)
          sendNotification(
            'AntiSleep 即将到期',
            `防锁屏将在 ${mins} 分钟后结束，请注意保存工作。`
          )
        }
      }

      if (remaining <= 0) {
        stopPreventionAction()
      }
    }

    timerRef.current = setInterval(checkExpiry, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [manageLifecycle, prevention.active, prevention.duration, prevention.startTime, stopPreventionAction, settings.expiryWarning, settings.expiryWarningMinutes])

  const getRemainingTimeText = useCallback((): string => {
    if (!prevention.active || !prevention.startTime) return ''
    if (prevention.duration === null) return '∞'

    const elapsed = (now - prevention.startTime) / 1000
    const totalSeconds = (prevention.duration ?? 0) * 60
    const remaining = Math.max(0, totalSeconds - elapsed)

    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    const seconds = Math.floor(remaining % 60)

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [now, prevention])

  const getStatusColor = useCallback((): string => {
    if (!prevention.active) return '#8E8E93' // gray
    if (prevention.duration !== null && prevention.startTime) {
      const elapsed = (now - prevention.startTime) / 1000
      const totalSeconds = prevention.duration * 60
      const remaining = totalSeconds - elapsed
      if (remaining < 300) return '#FF9F0A' // orange - less than 5 min
    }
    return '#30D158' // green
  }, [now, prevention])

  const isExpiringSoon = useCallback((): boolean => {
    if (!prevention.active || prevention.duration === null || !prevention.startTime) return false
    const elapsed = (now - prevention.startTime) / 1000
    const totalSeconds = prevention.duration * 60
    return totalSeconds - elapsed < 300
  }, [now, prevention])

  return {
    prevention,
    togglePrevention,
    startPreventionAction,
    stopPreventionAction,
    setPreventionMode,
    setDuration,
    getRemainingTimeText,
    getStatusColor,
    isExpiringSoon,
  }
}
