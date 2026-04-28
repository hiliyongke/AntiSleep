import { useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import { getThemeRenderer } from '../../themes/registry'

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

    // Destroy old renderer
    if (rendererRef.current) {
      rendererRef.current.destroy()
    }

    const renderer = getThemeRenderer(theme.current)
    if (!renderer) return

    renderer.init(canvas, {
      speed: theme.speed,
      density: theme.density,
      customColor: theme.customColor,
      opacity: theme.opacity,
    })
    rendererRef.current = renderer
    lastTimeRef.current = performance.now()

    // Start render loop
    const render = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time
      if (rendererRef.current) {
        rendererRef.current.render(delta)
      }
      animRef.current = requestAnimationFrame(render)
    }
    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
    }
  }, [theme.current, theme.speed, theme.density, theme.customColor, theme.opacity])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (rendererRef.current) {
        rendererRef.current.resize(canvas.width, canvas.height)
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
