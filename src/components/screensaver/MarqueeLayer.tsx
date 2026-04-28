import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeItem } from '../../types'

function glowTextShadow(item: MarqueeItem): string | undefined {
  if (!item.glowEnabled) return undefined
  const i = Math.max(0, item.glowIntensity)
  const color = item.glowColor
  return `0 0 ${i * 0.4}px ${color}, 0 0 ${i}px ${color}, 0 0 ${i * 2}px ${color}`
}

export function MarqueeLayer() {
  const marquee = useAppStore((s) => s.marquee)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Cycle through items for vertical/fade modes
  useEffect(() => {
    if (marquee.items.length <= 1) return
    if (marquee.mode === 'horizontal') return

    const speedMap = { slow: 8000, medium: 5000, fast: 3000 }
    const interval = speedMap[marquee.speed] || 5000

    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % marquee.items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [marquee.mode, marquee.speed, marquee.items.length])

  if (!marquee.items.length) return null

  const positionClasses = {
    top: 'top-[15%]',
    'center-bottom': 'bottom-[30%]',
    bottom: 'bottom-[10%]',
  }

  const item = marquee.items[currentIndex]
  if (!item) return null

  const durationMap = { slow: '15s', medium: '8s', fast: '4s' }
  const textShadow = glowTextShadow(item)
  const textStyle: React.CSSProperties = {
    fontSize: `${item.fontSize}px`,
    color: item.color,
    textShadow,
    fontWeight: 500,
  }

  return (
    <div className={`absolute inset-x-0 z-30 flex justify-center pointer-events-none ${positionClasses[marquee.position]}`}>
      {marquee.mode === 'horizontal' && (
        <div className="overflow-hidden max-w-[90vw]">
          <div
            className="whitespace-nowrap"
            style={{
              ...textStyle,
              animation: `marquee-horizontal ${durationMap[marquee.speed]} linear infinite`,
            }}
          >
            {item.content}
          </div>
        </div>
      )}

      {marquee.mode === 'vertical' && (
        <div className="text-center animate-fade-in">
          <div style={textStyle}>{item.content}</div>
        </div>
      )}

      {marquee.mode === 'fade' && (
        <div className="text-center animate-fade-in">
          <div key={currentIndex} style={textStyle}>
            {item.content}
          </div>
        </div>
      )}
    </div>
  )
}
