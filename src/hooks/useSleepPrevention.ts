import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'

/**
 * Hook for managing sleep prevention state and countdown
 */
export function useSleepPrevention() {
  const prevention = useAppStore((s) => s.prevention)
  const togglePrevention = useAppStore((s) => s.togglePrevention)
  const startPreventionAction = useAppStore((s) => s.startPreventionAction)
  const stopPreventionAction = useAppStore((s) => s.stopPreventionAction)
  const setPreventionMode = useAppStore((s) => s.setPreventionMode)
  const setDuration = useAppStore((s) => s.setDuration)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-stop when duration expires
  useEffect(() => {
    if (!prevention.active || prevention.duration === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const checkExpiry = () => {
      if (!prevention.startTime) return
      const elapsed = (Date.now() - prevention.startTime) / 1000
      const totalSeconds = (prevention.duration ?? 0) * 60
      if (elapsed >= totalSeconds) {
        stopPreventionAction()
      }
    }

    timerRef.current = setInterval(checkExpiry, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [prevention.active, prevention.duration, prevention.startTime, stopPreventionAction])

  const getRemainingTimeText = useCallback((): string => {
    if (!prevention.active || !prevention.startTime) return ''
    if (prevention.duration === null) return '∞'

    const elapsed = (Date.now() - prevention.startTime) / 1000
    const totalSeconds = (prevention.duration ?? 0) * 60
    const remaining = Math.max(0, totalSeconds - elapsed)

    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    const seconds = Math.floor(remaining % 60)

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [prevention])

  const getStatusColor = useCallback((): string => {
    if (!prevention.active) return '#8E8E93' // gray
    if (prevention.duration !== null && prevention.startTime) {
      const elapsed = (Date.now() - prevention.startTime) / 1000
      const totalSeconds = prevention.duration * 60
      const remaining = totalSeconds - elapsed
      if (remaining < 300) return '#FF9F0A' // orange - less than 5 min
    }
    return '#30D158' // green
  }, [prevention])

  const isExpiringSoon = useCallback((): boolean => {
    if (!prevention.active || prevention.duration === null || !prevention.startTime) return false
    const elapsed = (Date.now() - prevention.startTime) / 1000
    const totalSeconds = prevention.duration * 60
    return totalSeconds - elapsed < 300
  }, [prevention])

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
