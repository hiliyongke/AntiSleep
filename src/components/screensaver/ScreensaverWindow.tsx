import { useEffect } from 'react'
import { emit } from '@tauri-apps/api/event'
import { useScreensaver } from '../../hooks/useScreensaver'
import { useAppStore } from '../../stores/appStore'
import { WallpaperLayer } from './WallpaperLayer'
import { EffectLayer } from './EffectLayer'
import { MarqueeLayer } from './MarqueeLayer'
import { InfoOverlay } from './InfoOverlay'
import { FloatingControls } from './FloatingControls'

export function ScreensaverWindow() {
  const { controlsVisible } = useScreensaver()
  const theme = useAppStore((s) => s.theme)
  const marquee = useAppStore((s) => s.marquee)

  useEffect(() => {
    emit('antisleep://screensaver-opened').catch(() => {})

    return () => {
      emit('antisleep://screensaver-closed').catch(() => {})
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
    </div>
  )
}
