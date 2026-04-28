import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for managing screensaver window visibility and floating controls.
 */
export function useScreensaver() {
  const [controlsVisible, setControlsVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showControls = useCallback(() => {
    setControlsVisible(true)
    // Reset hide timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
    }, 3000)
  }, [])

  const hideControls = useCallback(() => {
    setControlsVisible(false)
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
    }
  }, [])

  // Listen for mouse movement to show controls
  useEffect(() => {
    const handleMouseMove = () => {
      showControls()
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [showControls])

  // Listen for ESC to close screensaver
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    controlsVisible,
    showControls,
    hideControls,
  }
}
