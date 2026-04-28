import { useRef, useState, useCallback, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'

// 3x3 grid gesture pattern (like Android)
const GRID_SIZE = 3
const DOT_COUNT = GRID_SIZE * GRID_SIZE

interface Point {
  x: number
  y: number
  index: number
}

export function GestureUnlock() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pattern, setPattern] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const [error, setError] = useState(false)
  const dotsRef = useRef<Point[]>([])
  const unlockWithGesture = useAppStore((s) => s.unlockWithGesture)
  const lockScreen = useAppStore((s) => s.lockScreen)

  const CANVAS_SIZE = 260
  const PADDING = 40
  const DOT_RADIUS = 10
  const HIT_RADIUS = 30

  // Calculate dot positions
  useEffect(() => {
    const dots: Point[] = []
    const step = (CANVAS_SIZE - PADDING * 2) / (GRID_SIZE - 1)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        dots.push({
          x: PADDING + col * step,
          y: PADDING + row * step,
          index: row * GRID_SIZE + col,
        })
      }
    }
    dotsRef.current = dots
  }, [])

  // Draw the pattern
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    const dots = dotsRef.current

    // Draw connecting lines
    if (pattern.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = error ? '#D13438' : '#0078D4'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const firstDot = dots[pattern[0]]
      ctx.moveTo(firstDot.x, firstDot.y)

      for (let i = 1; i < pattern.length; i++) {
        const dot = dots[pattern[i]]
        ctx.lineTo(dot.x, dot.y)
      }

      // Draw line to current mouse position
      if (isDrawing && currentPos) {
        ctx.lineTo(currentPos.x, currentPos.y)
      }

      ctx.stroke()
    }

    // Draw dots
    dots.forEach((dot, i) => {
      const isSelected = pattern.includes(i)

      // Outer ring
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, isSelected ? DOT_RADIUS + 4 : DOT_RADIUS + 2, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected
        ? error ? 'rgba(209, 52, 56, 0.5)' : 'rgba(0, 120, 212, 0.5)'
        : 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.stroke()

      // Inner dot
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, isSelected ? DOT_RADIUS - 2 : 4, 0, Math.PI * 2)
      ctx.fillStyle = isSelected
        ? error ? '#D13438' : '#0078D4'
        : 'rgba(255, 255, 255, 0.3)'
      ctx.fill()

      // Glow for selected dots
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, DOT_RADIUS + 8, 0, Math.PI * 2)
        ctx.fillStyle = error ? 'rgba(209, 52, 56, 0.1)' : 'rgba(0, 120, 212, 0.1)'
        ctx.fill()
      }
    })
  }, [pattern, isDrawing, currentPos, error])

  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (clientY - rect.top) * (CANVAS_SIZE / rect.height),
    }
  }, [])

  const hitTest = useCallback((pos: { x: number; y: number }): number | null => {
    for (const dot of dotsRef.current) {
      const dx = pos.x - dot.x
      const dy = pos.y - dot.y
      if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) {
        return dot.index
      }
    }
    return null
  }, [])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getCanvasPos(e)
    const hitIndex = hitTest(pos)
    if (hitIndex !== null) {
      setIsDrawing(true)
      setPattern([hitIndex])
      setCurrentPos(pos)
    }
  }, [getCanvasPos, hitTest])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const pos = getCanvasPos(e)
    setCurrentPos(pos)

    const hitIndex = hitTest(pos)
    if (hitIndex !== null && !pattern.includes(hitIndex)) {
      setPattern(prev => [...prev, hitIndex])
    }
  }, [isDrawing, pattern, getCanvasPos, hitTest])

  const handleEnd = useCallback(async () => {
    if (!isDrawing) return
    setIsDrawing(false)
    setCurrentPos(null)

    if (pattern.length >= 3) {
      const patternStr = pattern.join('-')
      const success = await unlockWithGesture(patternStr)
      if (!success) {
        setError(true)
        setTimeout(() => {
          setPattern([])
          setError(false)
        }, 600)
      }
    } else {
      setPattern([])
    }
  }, [isDrawing, pattern, unlockWithGesture])

  const isLocked = lockScreen.failedAttempts >= 5 && lockScreen.lastFailedTime !== null &&
    Date.now() - lockScreen.lastFailedTime < 30000

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="touch-none cursor-pointer"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        onMouseDown={isLocked ? undefined : handleStart}
        onMouseMove={isLocked ? undefined : handleMove}
        onMouseUp={isLocked ? undefined : handleEnd}
        onMouseLeave={isLocked ? undefined : handleEnd}
        onTouchStart={isLocked ? undefined : handleStart}
        onTouchMove={isLocked ? undefined : handleMove}
        onTouchEnd={isLocked ? undefined : handleEnd}
      />
      {isLocked && (
        <p className="text-xs text-functional-error">尝试次数过多，请等待 30 秒</p>
      )}
      {!isLocked && (
        <p className="text-xs text-text-tertiary">连接至少 3 个点以解锁</p>
      )}
    </div>
  )
}
