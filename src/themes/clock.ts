import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface DigitState {
  current: string
  previous: string
  flipProgress: number
  isFlipping: boolean
}

export class ClockRenderer implements ThemeRenderer {
  readonly id = 'clock' as const
  readonly name = '时钟'
  readonly category = 'minimal' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FFFFFF'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private clockStyle: 'analog' | 'digital' = 'analog'
  private digits: DigitState[] = []
  private lastTimeStr = ''
  private orbitDots: { angle: number; radius: number; speed: number; size: number }[] = []

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    // Init 6 digit slots: H H M M S S
    this.digits = Array.from({ length: 6 }, () => ({
      current: '0',
      previous: '0',
      flipProgress: 1,
      isFlipping: false,
    }))
    this.lastTimeStr = '000000'
    this.orbitDots = Array.from({ length: 10 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.22 + Math.random() * 0.12,
      speed: 0.08 + Math.random() * 0.15,
      size: 1 + Math.random() * 2,
    }))
  }

  setClockStyle(style: 'analog' | 'digital'): void {
    this.clockStyle = style
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const color = this.config.customColor || this.defaultColor

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.clockStyle === 'digital') {
      this.renderFlipClock(ctx, color, deltaTime)
    } else {
      this.renderAnalog(ctx, color)
    }
  }

  /**
   * Digital clock — single line text with blinking colon
   */
  private renderFlipClock(ctx: CanvasRenderingContext2D, color: string, _deltaTime: number): void {
    const w = this.canvas!.width
    const h = this.canvas!.height

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const blink = Math.sin(Date.now() / 500) > 0
    const colon = blink ? ':' : ' '
    const timeStr = `${hours}${colon}${minutes}${colon}${seconds}`

    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    const accentColor = this.config?.customColor || '#0078D4'
    const baseSize = Math.min(w, h)

    // Time text — single line
    const fontSize = Math.max(24, baseSize * 0.18)
    ctx.font = `200 ${fontSize}px "SF Mono", "SF Pro Display", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Subtle text shadow for glow
    ctx.save()
    ctx.shadowColor = accentColor + '40'
    ctx.shadowBlur = 20
    ctx.fillStyle = color + 'F0'
    ctx.fillText(timeStr, w / 2, h / 2 - baseSize * 0.02)
    ctx.restore()

    // Date below
    const dateFontSize = Math.max(12, baseSize * 0.032)
    ctx.font = `400 ${dateFontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = color + '50'
    ctx.fillText(dateStr, w / 2, h / 2 + fontSize * 0.45)

    // Subtle glow behind
    const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, baseSize * 0.5)
    glowGrad.addColorStop(0, accentColor + '08')
    glowGrad.addColorStop(1, accentColor + '00')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, w, h)

    for (const dot of this.orbitDots) {
      dot.angle += _deltaTime * dot.speed
      const dx = Math.cos(dot.angle) * baseSize * dot.radius
      const dy = Math.sin(dot.angle) * baseSize * dot.radius * 0.55
      ctx.beginPath()
      ctx.arc(w / 2 + dx, h / 2 + dy, dot.size, 0, Math.PI * 2)
      ctx.fillStyle = accentColor + '55'
      ctx.fill()
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
    ctx.lineTo(x + w, y + h - r)
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
    ctx.lineTo(x + r, y + h)
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
    ctx.lineTo(x, y + r)
    ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2)
    ctx.closePath()
  }

  private renderAnalog(ctx: CanvasRenderingContext2D, color: string): void {
    const w = this.canvas!.width
    const h = this.canvas!.height
    const radius = Math.min(w, h) * 0.14
    // Reserve space below dial for digital time + date
    const bottomReserve = radius * 1.6
    const cx = w / 2
    const cy = Math.min(h / 2, h - bottomReserve)

    const now = new Date()
    const hours = now.getHours() % 12
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const ms = now.getMilliseconds()
    const smoothSeconds = seconds + ms / 1000

    const accentColor = this.config?.customColor || '#0078D4'
    const s = (v: number) => v * (radius / 180)

    // ── Subtle ambient glow ──
    const ambientGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.8)
    ambientGrad.addColorStop(0, color + '06')
    ambientGrad.addColorStop(1, color + '00')
    ctx.fillStyle = ambientGrad
    ctx.fillRect(0, 0, w, h)

    for (const dot of this.orbitDots) {
      dot.angle += 0.0025
      const orbitRadius = radius * (1.15 + dot.radius * 0.4)
      const ox = cx + Math.cos(dot.angle) * orbitRadius
      const oy = cy + Math.sin(dot.angle) * orbitRadius * 0.82
      ctx.beginPath()
      ctx.arc(ox, oy, dot.size * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = accentColor + '44'
      ctx.fill()
    }

    // ── Watch face — subtle gradient like frosted glass ──
    const faceGrad = ctx.createRadialGradient(cx, cy - radius * 0.3, 0, cx, cy, radius)
    faceGrad.addColorStop(0, color + '0C')
    faceGrad.addColorStop(0.7, color + '06')
    faceGrad.addColorStop(1, color + '10')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = faceGrad
    ctx.fill()

    // ── Outer ring — thin, elegant ──
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = color + '30'
    ctx.lineWidth = s(2)
    ctx.stroke()

    // ── Minute dots — 60 tiny dots around the edge ──
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI * 2) / 60 - Math.PI / 2
      const dotR = radius - s(6)
      const dx = cx + Math.cos(angle) * dotR
      const dy = cy + Math.sin(angle) * dotR
      const isHour = i % 5 === 0
      ctx.beginPath()
      ctx.arc(dx, dy, isHour ? s(2.5) : s(0.8), 0, Math.PI * 2)
      ctx.fillStyle = isHour ? color + '99' : color + '25'
      ctx.fill()
    }

    // ── Hour numbers — 12, 3, 6, 9 ──
    const numRadius = radius - s(26)
    const numSize = Math.max(10, radius * 0.15)
    ctx.font = `300 ${numSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const majorNums = [12, 3, 6, 9]
    for (const n of majorNums) {
      const angle = (n * Math.PI * 2) / 12 - Math.PI / 2
      const nx = cx + Math.cos(angle) * numRadius
      const ny = cy + Math.sin(angle) * numRadius
      ctx.fillStyle = color + 'CC'
      ctx.fillText(String(n), nx, ny + s(1))
    }

    // ── Date window at 3 o'clock position ──
    const dateX = cx + radius * 0.42
    const dateY = cy
    const dateStr = String(now.getDate())
    const dateFontSize = Math.max(8, radius * 0.085)
    const dateBoxW = s(22)
    const dateBoxH = s(18)
    // Date box background
    ctx.fillStyle = color + '10'
    this.roundRect(ctx, dateX - dateBoxW / 2, dateY - dateBoxH / 2, dateBoxW, dateBoxH, s(4))
    ctx.fill()
    ctx.strokeStyle = color + '18'
    ctx.lineWidth = s(0.8)
    this.roundRect(ctx, dateX - dateBoxW / 2, dateY - dateBoxH / 2, dateBoxW, dateBoxH, s(4))
    ctx.stroke()
    // Date text
    ctx.font = `500 ${dateFontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color + 'AA'
    ctx.fillText(dateStr, dateX, dateY + s(0.5))

    // ── Hour hand — elegant tapered with rounded tip ──
    const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12 - Math.PI / 2
    ctx.save()
    ctx.shadowColor = color + '20'
    ctx.shadowBlur = s(8)
    ctx.shadowOffsetY = s(2)
    this.drawTaperedHand(ctx, cx, cy, hourAngle, radius * 0.5, s(7), s(2.5), color + 'EE')
    ctx.restore()

    // ── Minute hand — longer, thinner ──
    const minuteAngle = ((minutes + smoothSeconds / 60) * Math.PI * 2) / 60 - Math.PI / 2
    ctx.save()
    ctx.shadowColor = color + '18'
    ctx.shadowBlur = s(6)
    ctx.shadowOffsetY = s(1.5)
    this.drawTaperedHand(ctx, cx, cy, minuteAngle, radius * 0.73, s(5), s(1.5), color + 'DD')
    ctx.restore()

    // ── Second hand — thin line with counterweight + circle ──
    const secondAngle = (smoothSeconds * Math.PI * 2) / 60 - Math.PI / 2
    // Counterweight (tail)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(secondAngle + Math.PI) * radius * 0.18,
      cy + Math.sin(secondAngle + Math.PI) * radius * 0.18,
    )
    ctx.strokeStyle = accentColor + 'BB'
    ctx.lineWidth = s(2)
    ctx.lineCap = 'round'
    ctx.stroke()
    // Main line
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(secondAngle) * radius * 0.82,
      cy + Math.sin(secondAngle) * radius * 0.82,
    )
    ctx.strokeStyle = accentColor + 'DD'
    ctx.lineWidth = s(1.2)
    ctx.lineCap = 'round'
    ctx.stroke()
    // Tip circle
    const tipX = cx + Math.cos(secondAngle) * radius * 0.7
    const tipY = cy + Math.sin(secondAngle) * radius * 0.7
    ctx.beginPath()
    ctx.arc(tipX, tipY, s(3), 0, Math.PI * 2)
    ctx.strokeStyle = accentColor + '99'
    ctx.lineWidth = s(1)
    ctx.stroke()

    // ── Center dot ──
    ctx.beginPath()
    ctx.arc(cx, cy, s(4), 0, Math.PI * 2)
    ctx.fillStyle = accentColor
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, s(1.8), 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // ── Digital time below the dial ──
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const fullDateStr = now.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

    const digitalFontSize = Math.max(10, radius * 0.15)
    const timeY = cy + radius + s(18)
    ctx.font = `200 ${digitalFontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = color + '99'
    ctx.fillText(timeStr, cx, timeY)

    const dateFontSize2 = digitalFontSize * 0.55
    const fullDateY = timeY + digitalFontSize + s(6)
    ctx.font = `400 ${dateFontSize2}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.fillStyle = color + '40'
    ctx.fillText(fullDateStr, cx, fullDateY)
  }

  private drawTaperedHand(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    angle: number,
    length: number,
    baseWidth: number,
    tipWidth: number,
    color: string,
  ): void {
    const perpAngle = angle + Math.PI / 2
    const bx1 = cx + Math.cos(perpAngle) * baseWidth / 2
    const by1 = cy + Math.sin(perpAngle) * baseWidth / 2
    const bx2 = cx - Math.cos(perpAngle) * baseWidth / 2
    const by2 = cy - Math.sin(perpAngle) * baseWidth / 2
    const tx1 = cx + Math.cos(angle) * length + Math.cos(perpAngle) * tipWidth / 2
    const ty1 = cy + Math.sin(angle) * length + Math.sin(perpAngle) * tipWidth / 2
    const tx2 = cx + Math.cos(angle) * length - Math.cos(perpAngle) * tipWidth / 2
    const ty2 = cy + Math.sin(angle) * length - Math.sin(perpAngle) * tipWidth / 2

    ctx.beginPath()
    ctx.moveTo(bx1, by1)
    ctx.lineTo(tx1, ty1)
    ctx.lineTo(tx2, ty2)
    ctx.lineTo(bx2, by2)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  private drawHand(
    cx: number,
    cy: number,
    angle: number,
    length: number,
    width: number,
    color: string,
  ): void {
    if (!this.ctx) return
    this.ctx.beginPath()
    this.ctx.moveTo(cx, cy)
    this.ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
  }

  resize(): void {}

  destroy(): void {
    this.ctx = null
    this.canvas = null
  }
}
