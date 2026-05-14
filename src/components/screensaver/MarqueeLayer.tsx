import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeItem, MarqueePosition, TextAnimation } from '../../types'

function glowTextShadow(item: MarqueeItem): string | undefined {
  if (!item.glowEnabled) return undefined
  const i = Math.max(0, item.glowIntensity)
  const color = item.glowColor
  return `0 0 ${i * 0.4}px ${color}, 0 0 ${i}px ${color}, 0 0 ${i * 2}px ${color}`
}

/**
 * 文案自定义位置：positionX/Y 为屏幕百分比（0-100），优先于预设位置
 */
function getMarqueePositionStyle(
  item: MarqueeItem,
): React.CSSProperties {
  const px = item.positionX
  const py = item.positionY
  // 自定义坐标（百分比）→ 绝对定位
  if (px !== undefined || py !== undefined) {
    const style: React.CSSProperties = { position: 'absolute' }
    if (px !== undefined) style.left = `${px}%`
    if (py !== undefined) style.top = `${py}%`
    style.transform = 'translate(-50%, -50%)'
    return style
  }
  // 预设位置：返回空对象，由调用方的 className 控制
  return {}
}

/**
 * 预设位置对应的 className（仅当无自定义坐标时使用）
 */
function getPresetPositionClass(position: MarqueePosition): string {
  const map: Record<MarqueePosition, string> = {
    top: 'top-[12%] left-0 right-0 justify-center items-start',
    center: 'top-1/2 left-0 right-0 -translate-y-1/2 justify-center items-center',
    'center-bottom': 'bottom-[28%] left-0 right-0 justify-center items-end',
    bottom: 'bottom-[10%] left-0 right-0 justify-center items-end',
    'top-left': 'top-[12%] left-[5%] justify-start items-start',
    'top-right': 'top-[12%] right-[5%] justify-end items-start',
    'bottom-left': 'bottom-[10%] left-[5%] justify-start items-end',
    'bottom-right': 'bottom-[10%] right-[5%] justify-end items-end',
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

function useTypewriter(text: string, speed: string, active: boolean) {
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

function buildTextStyle(item: MarqueeItem): React.CSSProperties {
  const textShadow = glowTextShadow(item)
  return {
    fontSize: `${item.fontSize}px`,
    color: item.color,
    textShadow,
    fontWeight: item.fontWeight ?? 500,
    letterSpacing: item.letterSpacing ? `${item.letterSpacing}px` : undefined,
    lineHeight: item.lineHeight ?? 1.4,
    textAlign: item.textAlign ?? 'center',
    textTransform: item.textTransform ?? 'none',
  }
}

function buildCardStyle(item: MarqueeItem): React.CSSProperties | undefined {
  if (!item.bgEnabled) return undefined
  const bgOpacity = item.bgOpacity ?? 30
  const hex = item.bgColor ?? '#000000'
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${bgOpacity / 100})`,
    borderRadius: `${item.borderRadius ?? 8}px`,
    padding: `${item.paddingY ?? 12}px ${item.paddingX ?? 20}px`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }
}

function SingleItem({ item }: { item: MarqueeItem }) {
  const mode = item.mode ?? 'fade'
  const speed = item.speed ?? 'medium'
  const durationMap = { slow: '15s', medium: '8s', fast: '4s' }
  const animation = item.animation ?? 'none'
  const animClass = getAnimationClass(animation)
  const textStyle = buildTextStyle(item)
  const cardStyle = buildCardStyle(item)
  const { display, showCursor } = useTypewriter(item.content, speed, mode === 'typewriter')

  const wrap = (children: React.ReactNode) => {
    if (cardStyle) {
      return (
        <div className={`inline-block ${animClass}`} style={cardStyle}>
          <div style={textStyle}>{children}</div>
        </div>
      )
    }
    return (
      <div className={`${animClass}`} style={textStyle}>
        {children}
      </div>
    )
  }

  if (mode === 'typewriter') {
    return wrap(
      <>
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
      </>
    )
  }

  if (mode === 'static') {
    return wrap(item.content)
  }

  if (mode === 'horizontal') {
    const gap = Math.max(48, Math.round(item.fontSize * 1.5))
    const segment = cardStyle ? (
      <div className="inline-block" style={cardStyle}>
        <div style={textStyle}>{item.content}</div>
      </div>
    ) : (
      <div style={textStyle}>{item.content}</div>
    )

    return (
      <div className="overflow-hidden" style={{ maxWidth: 'min(92vw, calc(100vw - 48px))' }}>
        <div
          className={`inline-flex items-center min-w-max ${animClass}`}
          style={{
            animation: `marquee-loop ${durationMap[speed]} linear infinite`,
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="shrink-0 whitespace-nowrap" style={{ paddingRight: `${gap}px` }}>
              {segment}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (mode === 'vertical') {
    return wrap(item.content)
  }

  // fade
  return wrap(item.content)
}

export function MarqueeLayer() {
  const marquee = useAppStore((s) => s.marquee)

  const enabledItems = useMemo(
    () => marquee.items.filter((i) => i.enabled),
    [marquee.items]
  )

  if (!marquee.enabled || !enabledItems.length) return null

  // 始终渲染所有启用的文案，每条使用自己的独立配置
  return (
    <>
      {enabledItems.map((item) => {
        const customStyle = getMarqueePositionStyle(item)
        const pos = item.position ?? 'center-bottom'
        const presetClass = Object.keys(customStyle).length === 0 ? getPresetPositionClass(pos) : ''
        return (
          <div
            key={item.id}
            className={`absolute z-30 flex pointer-events-none ${presetClass}`}
            style={customStyle}
          >
            <SingleItem item={item} />
          </div>
        )
      })}
    </>
  )
}
