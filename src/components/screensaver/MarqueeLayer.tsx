import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeItem, MarqueePosition, TextAnimation, MarqueeSpeed } from '../../types'

function glowTextShadow(item: MarqueeItem): string | undefined {
  if (!item.glowEnabled) return undefined
  const i = Math.max(0, item.glowIntensity)
  const color = item.glowColor
  return `0 0 ${i * 0.4}px ${color}, 0 0 ${i}px ${color}, 0 0 ${i * 2}px ${color}`
}

function getPositionClasses(position: MarqueePosition): string {
  const map: Record<MarqueePosition, string> = {
    top: 'top-[12%] left-0 right-0 justify-center',
    center: 'top-1/2 left-0 right-0 -translate-y-1/2 justify-center',
    'center-bottom': 'bottom-[28%] left-0 right-0 justify-center',
    bottom: 'bottom-[10%] left-0 right-0 justify-center',
    'top-left': 'top-[12%] left-[5%] justify-start',
    'top-right': 'top-[12%] right-[5%] justify-end',
    'bottom-left': 'bottom-[10%] left-[5%] justify-start',
    'bottom-right': 'bottom-[10%] right-[5%] justify-end',
  }
  return map[position] || map['center-bottom']
}

function getAnimationClass(animation: TextAnimation): string {
  switch (animation) {
    case 'pulse':
      return 'animate-marquee-pulse'
    case 'bounce':
      return 'animate-marquee-bounce'
    case 'float':
      return 'animate-marquee-float'
    case 'glow-pulse':
      return 'animate-marquee-glow'
    case 'shake':
      return 'animate-marquee-shake'
    default:
      return ''
  }
}

function useTypewriter(text: string, speed: MarqueeSpeed, active: boolean) {
  const [display, setDisplay] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const idxRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplay('')
      idxRef.current = 0
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    idxRef.current = 0
    setDisplay('')
    const interval = speed === 'fast' ? 60 : speed === 'slow' ? 150 : 100
    timerRef.current = setInterval(() => {
      idxRef.current += 1
      if (idxRef.current > text.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        return
      }
      setDisplay(text.slice(0, idxRef.current))
    }, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [text, speed, active])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((s) => !s), 530)
    return () => clearInterval(blink)
  }, [])

  return { display, showCursor }
}

function SingleItem({
  item,
  mode,
  speed,
  globalAnimation,
}: {
  item: MarqueeItem
  mode: import('../../types').MarqueeMode
  speed: import('../../types').MarqueeSpeed
  globalAnimation: TextAnimation
}) {
  const durationMap = { slow: '15s', medium: '8s', fast: '4s' }
  const textShadow = glowTextShadow(item)
  const animation = item.animation ?? globalAnimation
  const animClass = getAnimationClass(animation)

  const textStyle: React.CSSProperties = {
    fontSize: `${item.fontSize}px`,
    color: item.color,
    textShadow,
    fontWeight: 500,
  }

  if (mode === 'typewriter') {
    const { display, showCursor } = useTypewriter(item.content, speed, true)
    return (
      <div className={`text-center ${animClass}`} style={textStyle}>
        {display}
        <span
          className="inline-block w-[2px] ml-0.5 align-middle"
          style={{
            height: `${item.fontSize * 0.8}px`,
            backgroundColor: item.color,
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s',
          }}
        />
      </div>
    )
  }

  if (mode === 'static') {
    return (
      <div className={`text-center ${animClass}`} style={textStyle}>
        {item.content}
      </div>
    )
  }

  if (mode === 'horizontal') {
    return (
      <div className="overflow-hidden max-w-[90vw]">
        <div
          className={`whitespace-nowrap ${animClass}`}
          style={{
            ...textStyle,
            animation: `marquee-horizontal ${durationMap[speed]} linear infinite`,
          }}
        >
          {item.content}
        </div>
      </div>
    )
  }

  if (mode === 'vertical') {
    return (
      <div className={`text-center animate-fade-in ${animClass}`} style={textStyle}>
        {item.content}
      </div>
    )
  }

  // fade
  return (
    <div className={`text-center animate-fade-in ${animClass}`} style={textStyle}>
      {item.content}
    </div>
  )
}

export function MarqueeLayer() {
  const marquee = useAppStore((s) => s.marquee)
  const [currentIndex, setCurrentIndex] = useState(0)

  const enabledItems = useMemo(
    () => marquee.items.filter((i) => i.enabled),
    [marquee.items]
  )

  // Cycle index for single/cycle strategies
  useEffect(() => {
    if (marquee.displayStrategy === 'all') return
    if (enabledItems.length <= 1) return
    if (marquee.mode === 'horizontal') return

    const speedMap = { slow: 8000, medium: 5000, fast: 3000 }
    const interval = speedMap[marquee.speed] || 5000

    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % enabledItems.length)
    }, interval)

    return () => clearInterval(timer)
  }, [marquee.mode, marquee.speed, enabledItems.length, marquee.displayStrategy])

  if (!marquee.enabled || !enabledItems.length) return null

  const strategy = marquee.displayStrategy

  // ALL strategy: render all enabled items at their own positions
  if (strategy === 'all') {
    return (
      <>
        {enabledItems.map((item) => {
          const pos = item.position ?? marquee.position
          const classes = getPositionClasses(pos)
          return (
            <div
              key={item.id}
              className={`absolute z-30 flex pointer-events-none ${classes}`}
            >
              <SingleItem
                item={item}
                mode={marquee.mode}
                speed={marquee.speed}
                globalAnimation={marquee.animation}
              />
            </div>
          )
        })}
      </>
    )
  }

  // SINGLE or CYCLE: show one item at global position
  const item = enabledItems[currentIndex]
  if (!item) return null

  const classes = getPositionClasses(marquee.position)

  return (
    <div className={`absolute z-30 flex pointer-events-none ${classes}`}>
      <SingleItem
        item={item}
        mode={marquee.mode}
        speed={marquee.speed}
        globalAnimation={marquee.animation}
      />
    </div>
  )
}
