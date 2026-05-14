import { useEffect, useRef, useState, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore'
import { getThemeRenderer } from '../../themes/registry'
import {
  getWallpaperUrl,
  isVideoWallpaper,
  isGradientWallpaper,
  getGradientCss,
} from '../../wallpaper/types'
import type { MarqueeItem, MarqueePosition, TextAnimation } from '../../types'
import { Play, Square, Eye } from 'lucide-react'

/* ─── Wallpaper sub-component ─── */
function PreviewWallpaper() {
  const wallpaper = useAppStore((s) => s.wallpaper)
  const source = wallpaper.current
  const opacity = wallpaper.opacity / 100
  const blur = wallpaper.blur
  const blurStyle: React.CSSProperties = blur > 0 ? { filter: `blur(${blur}px)` } : {}

  if (!source || source.id === 'built-in-black') {
    return <div className="absolute inset-0 bg-black" />
  }

  if (isGradientWallpaper(source)) {
    return (
      <div
        className="absolute inset-0"
        style={{ opacity, background: getGradientCss(source), ...blurStyle }}
      />
    )
  }

  const url = getWallpaperUrl(source)
  if (isVideoWallpaper(source)) {
    return (
      <div className="absolute inset-0" style={{ opacity }}>
        <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={blurStyle} />
      </div>
    )
  }

  return (
    <div className="absolute inset-0" style={{ opacity }}>
      <img src={url} alt="" className="w-full h-full object-cover" draggable={false} style={blurStyle} />
    </div>
  )
}

function syncPreviewCanvasSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  const parent = canvas.parentElement
  if (!parent) {
    return {
      width: canvas.width,
      height: canvas.height,
    }
  }

  const width = Math.max(1, parent.offsetWidth)
  const height = Math.max(1, parent.offsetHeight)
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
  return { width, height }
}

const MAX_PREVIEW_DELTA_SECONDS = 0.05

/* ─── Effect (Canvas theme) sub-component ─── */
function PreviewEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof getThemeRenderer> | null>(null)
  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    cancelAnimationFrame(animRef.current)
    if (rendererRef.current) rendererRef.current.destroy()
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { width, height } = syncPreviewCanvasSize(canvas)

    const renderer = getThemeRenderer(theme.current)
    if (!renderer) return

    renderer.init(canvas, {
      speed: theme.speed,
      density: theme.density,
      customColor: theme.customColor,
      opacity: theme.opacity,
      clockSize: theme.clockSize,
      clockPosition: theme.clockPosition,
      clockPositionX: theme.clockPositionX,
      clockPositionY: theme.clockPositionY,
    })
    renderer.resize(width, height)
    if (theme.current === 'clock' && renderer.setClockStyle) {
      renderer.setClockStyle(theme.clockStyle)
    }
    rendererRef.current = renderer
    lastTimeRef.current = performance.now()

    const render = (time: number) => {
      animRef.current = requestAnimationFrame(render)
      const elapsed = time - (lastFrameTimeRef.current || 0)
      if (elapsed < 1000 / 60) return
      lastFrameTimeRef.current = time
      const delta = Math.min((time - lastTimeRef.current) / 1000, MAX_PREVIEW_DELTA_SECONDS)
      lastTimeRef.current = time
      if (rendererRef.current) rendererRef.current.render(delta)
    }
    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
    }
  }, [theme.current, theme.speed, theme.density, theme.customColor, theme.opacity, theme.clockStyle, theme.clockSize, theme.clockPosition])

  // 时钟风格/大小/位置变化时实时生效（不重建渲染器）
  useEffect(() => {
    const renderer = rendererRef.current
    if (theme.current === 'clock' && renderer) {
      if (renderer.setClockStyle) renderer.setClockStyle(theme.clockStyle)
      if (renderer.setClockSize) renderer.setClockSize(theme.clockSize)
      if (renderer.setClockPosition) renderer.setClockPosition(theme.clockPosition)
      if (renderer.setClockPositionX) renderer.setClockPositionX(theme.clockPositionX)
      if (renderer.setClockPositionY) renderer.setClockPositionY(theme.clockPositionY)
    }
  }, [theme.current, theme.clockStyle, theme.clockSize, theme.clockPosition, theme.clockPositionX, theme.clockPositionY])

  // Resize canvas to match virtual coordinate space (before CSS transform scaling)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleResize = () => {
      const { width, height } = syncPreviewCanvasSize(canvas)
      if (rendererRef.current) rendererRef.current.resize(width, height)
    }
    handleResize()
    const parent = canvas.parentElement
    if (!parent) return
    const ro = new ResizeObserver(handleResize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  if (!theme.enabled) return null
  return <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" style={{ opacity: theme.opacity / 100 }} />
}

/* ─── Marquee helpers ─── */
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
  if (px !== undefined || py !== undefined) {
    const style: React.CSSProperties = { position: 'absolute' }
    if (px !== undefined) style.left = `${px}%`
    if (py !== undefined) style.top = `${py}%`
    style.transform = 'translate(-50%, -50%)'
    return style
  }
  return {}
}

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
    case 'pulse': return 'animate-marquee-pulse'
    case 'bounce': return 'animate-marquee-bounce'
    case 'float': return 'animate-marquee-float'
    case 'glow-pulse': return 'animate-marquee-glow'
    case 'shake': return 'animate-marquee-shake'
    default: return ''
  }
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

function useTypewriter(text: string, speed: string, active: boolean) {
  const [display, setDisplay] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const idxRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) { setDisplay(''); idxRef.current = 0; if (timerRef.current) clearInterval(timerRef.current); return }
    idxRef.current = 0; setDisplay('')
    const interval = speed === 'fast' ? 60 : speed === 'slow' ? 150 : 100
    timerRef.current = setInterval(() => {
      idxRef.current += 1
      if (idxRef.current > text.length) { if (timerRef.current) clearInterval(timerRef.current); return }
      setDisplay(text.slice(0, idxRef.current))
    }, interval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [text, speed, active])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((s) => !s), 530)
    return () => clearInterval(blink)
  }, [])

  return { display, showCursor }
}

function PreviewSingleItem({ item }: { item: MarqueeItem }) {
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
        <span className="inline-block w-[2px] ml-0.5 align-middle" style={{ height: `${item.fontSize * 0.8}px`, backgroundColor: item.color, opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }} />
      </>
    )
  }
  if (mode === 'static') return wrap(item.content)
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
      <div className="overflow-hidden" style={{ maxWidth: 'min(92%, calc(100% - 32px))' }}>
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
  return wrap(item.content)
}

function PreviewMarquee() {
  const marquee = useAppStore((s) => s.marquee)
  const enabledItems = useMemo(() => marquee.items.filter((i) => i.enabled), [marquee.items])

  if (!marquee.enabled || !enabledItems.length) return null

  return (
    <>
      {enabledItems.map((item) => {
        const customStyle = getMarqueePositionStyle(item)
        const pos = item.position ?? 'center-bottom'
        const presetClass = Object.keys(customStyle).length === 0 ? getPresetPositionClass(pos) : ''
        return (
          <div key={item.id} className={`absolute z-20 flex pointer-events-none ${presetClass}`} style={customStyle}>
            <PreviewSingleItem item={item} />
          </div>
        )
      })}
    </>
  )
}

/* ─── Info overlay sub-component ─── */
function PreviewInfoOverlay() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="absolute top-3 left-3 z-20 pointer-events-none">
      <div className="rounded-md px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
        <span className="text-xs font-light tabular-nums text-white/90">{timeStr}</span>
        <div className="w-px h-3 bg-white/20" />
        <span className="text-[10px] tabular-nums text-white/60">59:32</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#16C60C]" />
      </div>
    </div>
  )
}

/* ─── Main preview component ─── */

/** Virtual screen resolution used for preview — matches typical real display */
const VIRTUAL_W = 1920
const VIRTUAL_H = 1080

export function PreviewSettings({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const theme = useAppStore((s) => s.theme)
  const marquee = useAppStore((s) => s.marquee)
  const wallpaper = useAppStore((s) => s.wallpaper)

  // Calculate scale factor to fit virtual screen into the container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      const s = Math.min(rect.width / VIRTUAL_W, rect.height / VIRTUAL_H)
      setScale(s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const previewContent = isPlaying ? (
    <>
      <PreviewWallpaper />
      <PreviewEffect key={theme.current} />
      <PreviewMarquee />
      <PreviewInfoOverlay />

      {/* Floating controls mock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="rounded-full px-6 py-3 flex items-center gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
          <span className="text-sm tabular-nums text-white/60 pr-3" style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}>59:32</span>
          <PaletteIcon active={theme.enabled} />
          <ScrollIcon active={marquee.enabled} />
          <CloseIcon />
        </div>
      </div>
    </>
  ) : (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Play size={64} style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-xl" style={{ color: 'var(--text-tertiary)' }}>点击播放按钮预览效果</p>
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="flex flex-col h-full">
        {/* Compact header bar */}
        <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-fluent)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>整体效果预览</span>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-fluent)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
          >
            {isPlaying ? <Square size={10} /> : <Play size={10} />}
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>

        {/* Preview canvas — scales virtual 1920×1080 to fit */}
        <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
          <div
            ref={containerRef}
            className="relative rounded-lg overflow-hidden border"
            style={{
              borderColor: 'var(--border-fluent)',
              aspectRatio: `${VIRTUAL_W} / ${VIRTUAL_H}`,
              background: '#000',
              width: '100%',
              maxHeight: '100%',
            }}
          >
            <div
              className="absolute origin-top-left"
              style={{
                width: VIRTUAL_W,
                height: VIRTUAL_H,
                transform: `scale(${scale})`,
                opacity: scale > 0 ? 1 : 0,
                transition: 'opacity 0.2s',
                pointerEvents: 'none',
              }}
            >
              {previewContent}
            </div>
          </div>
        </div>

        {/* Layer indicators — compact footer */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="grid grid-cols-4 gap-1.5">
            <LayerBadge active={!!wallpaper.current && wallpaper.current.id !== 'built-in-black'} label="壁纸" />
            <LayerBadge active={theme.enabled} label="特效" />
            <LayerBadge active={marquee.enabled && marquee.items.some((i) => i.enabled)} label="文案" />
            <LayerBadge active label="信息浮层" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Eye size={18} />
          整体效果预览
        </h2>
      </div>

      {/* Play/pause toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          播放控制
        </span>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-fluent)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
        >
          {isPlaying ? <Square size={10} /> : <Play size={10} />}
          {isPlaying ? '暂停' : '播放'}
        </button>
      </div>

      {/* Preview canvas — scales virtual 1920×1080 to fit */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden border"
        style={{
          borderColor: 'var(--border-fluent)',
          aspectRatio: `${VIRTUAL_W} / ${VIRTUAL_H}`,
          background: '#000',
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            width: VIRTUAL_W,
            height: VIRTUAL_H,
            transform: `scale(${scale})`,
            opacity: scale > 0 ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
        >
          {previewContent}
        </div>
      </div>

      {/* Layer indicators */}
      <div className="grid grid-cols-4 gap-1.5">
        <LayerBadge active={!!wallpaper.current && wallpaper.current.id !== 'built-in-black'} label="壁纸" />
        <LayerBadge active={theme.enabled} label="特效" />
        <LayerBadge active={marquee.enabled && marquee.items.some((i) => i.enabled)} label="文案" />
        <LayerBadge active label="信息浮层" />
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
        此预览实时反映当前所有设置组合效果。修改壁纸、特效、文案等配置后，预览会自动更新。
      </p>
    </div>
  )
}

/* ─── Small helper components ─── */
function LayerBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px]"
      style={{
        backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
        border: `1px solid ${active ? 'var(--border-fluent-hover)' : 'var(--border-fluent)'}`,
        color: active ? 'var(--text-primary)' : 'var(--text-disabled)',
      }}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-accent' : 'bg-gray-400/30'}`} />
      {label}
    </div>
  )
}

function PaletteIcon({ active }: { active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? '#0078D4' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z"/>
    </svg>
  )
}

function ScrollIcon({ active }: { active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? '#0078D4' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M10 20v4"/><path d="M14 20v4"/><path d="M8 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-5"/><path d="M8 8v8"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}
