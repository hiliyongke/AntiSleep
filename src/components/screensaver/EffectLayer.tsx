import { useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import { getThemeRenderer } from '../../themes/registry'

function syncCanvasSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  const width = Math.max(1, window.innerWidth)
  const height = Math.max(1, window.innerHeight)

  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height

  return { width, height }
}

const MAX_DELTA_SECONDS = 0.05

export function EffectLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof getThemeRenderer> | null>(null)
  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const theme = useAppStore((s) => s.theme)

  // Init / switch theme renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Destroy old renderer and clear canvas
    cancelAnimationFrame(animRef.current)
    if (rendererRef.current) {
      rendererRef.current.destroy()
    }
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const { width, height } = syncCanvasSize(canvas)

    const renderer = getThemeRenderer(theme.current)
    if (!renderer) return

    renderer.init(canvas, {
      speed: theme.speed,
      density: theme.density,
      customColor: theme.customColor,
      opacity: theme.opacity,
    })

    // Sync clock style if applicable
    renderer.resize(width, height)
    if (theme.current === 'clock' && renderer.setClockStyle) {
      renderer.setClockStyle(theme.clockStyle)
    }

    rendererRef.current = renderer
    lastTimeRef.current = performance.now()

    // Start render loop with frame rate limiting (~60fps)
    let lastFrameTime = 0
    const FRAME_INTERVAL = 1000 / 60
    const render = (time: number) => {
      animRef.current = requestAnimationFrame(render)
      const elapsed = time - lastFrameTime
      if (elapsed < FRAME_INTERVAL) return
      lastFrameTime = time
      const delta = Math.min((time - lastTimeRef.current) / 1000, MAX_DELTA_SECONDS)
      lastTimeRef.current = time
      if (rendererRef.current) {
        rendererRef.current.render(delta)
      }
    }
    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
    }
  }, [theme.current, theme.speed, theme.density, theme.customColor, theme.opacity, theme.clockStyle])

  // Sync clock style when it changes (without re-creating renderer)
  useEffect(() => {
    const renderer = rendererRef.current
    if (theme.current === 'clock' && renderer && renderer.setClockStyle) {
      renderer.setClockStyle(theme.clockStyle)
    }
  }, [theme.clockStyle, theme.current])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const { width, height } = syncCanvasSize(canvas)
      if (rendererRef.current) {
        rendererRef.current.resize(width, height)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ opacity: theme.opacity / 100 }}
    />
  )
}
