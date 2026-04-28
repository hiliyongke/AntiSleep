import { useEffect } from 'react'
import { useScreensaver } from '../../hooks/useScreensaver'
import { useAppStore } from '../../stores/appStore'
import { WallpaperLayer } from './WallpaperLayer'
import { EffectLayer } from './EffectLayer'
import { MarqueeLayer } from './MarqueeLayer'
import { InfoOverlay } from './InfoOverlay'
import { FloatingControls } from './FloatingControls'
import { LockScreenOverlay } from '../lock/LockScreenOverlay'

export function ScreensaverWindow() {
  const { controlsVisible } = useScreensaver()
  const lockScreen = useAppStore((s) => s.lockScreen)
  const activateLockScreen = useAppStore((s) => s.activateLockScreen)
  const theme = useAppStore((s) => s.theme)
  const marquee = useAppStore((s) => s.marquee)

  // Auto-lock when screensaver opens if lock is enabled
  useEffect(() => {
    if (lockScreen.enabled && !lockScreen.locked) {
      const delay = lockScreen.autoLockDelay * 1000
      if (delay === 0) {
        activateLockScreen()
      } else {
        const timer = setTimeout(activateLockScreen, delay)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      {/* Layer 1: Wallpaper */}
      <WallpaperLayer />

      {/* Layer 2: Effect Canvas */}
      {theme.enabled && <EffectLayer />}

      {/* Layer 3: Marquee + Info */}
      {marquee.enabled && <MarqueeLayer />}
      <InfoOverlay />

      {/* Floating controls */}
      <FloatingControls visible={controlsVisible} />

      {/* Lock screen overlay */}
      {lockScreen.enabled && lockScreen.locked && <LockScreenOverlay />}
    </div>
  )
}
