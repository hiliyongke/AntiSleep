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
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(w, h) * 0.26

    const now = new Date()
    const hours = now.getHours() % 12
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const ms = now.getMilliseconds()
    const smoothSeconds = seconds + ms / 1000

    const accentColor = this.config?.customColor || '#0078D4'

    // Outer subtle ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2)
    ctx.strokeStyle = color + '12'
    ctx.lineWidth = 8
    ctx.stroke()

    // Clock face ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = color + '40'
    ctx.lineWidth = 5
    ctx.stroke()

    // Hour markers
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI * 2) / 60 - Math.PI / 2
      const isHour = i % 5 === 0
      const isMajor = i % 15 === 0
      const innerR = isHour ? (isMajor ? radius - 20 : radius - 14) : radius - 8
      const outerR = isHour ? (isMajor ? radius - 4 : radius - 6) : radius - 5
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
      ctx.strokeStyle = isHour ? (isMajor ? color + 'DD' : color + '88') : color + '33'
      ctx.lineWidth = isHour ? (isMajor ? 3 : 2) : 1
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // Hour hand
    const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12 - Math.PI / 2
    this.drawHand(cx, cy, hourAngle, radius * 0.55, 5.5, color + 'EE')

    // Minute hand
    const minuteAngle = ((minutes + smoothSeconds / 60) * Math.PI * 2) / 60 - Math.PI / 2
    this.drawHand(cx, cy, minuteAngle, radius * 0.78, 3.2, color + 'CC')

    // Second hand with accent color
    const secondAngle = (smoothSeconds * Math.PI * 2) / 60 - Math.PI / 2
    this.drawHand(cx, cy, secondAngle, radius * 0.88, 2, accentColor)
    this.drawHand(cx, cy, secondAngle + Math.PI, radius * 0.18, 2, accentColor)

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2)
    ctx.fillStyle = accentColor
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // Digital time below
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const dateStr = now.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    const fontSize = Math.max(14, radius * 0.14)
    ctx.font = `300 ${fontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = color + '88'
    ctx.fillText(timeStr, cx, cy + radius + 40)

    ctx.font = `400 ${fontSize * 0.55}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.fillStyle = color + '44'
    ctx.fillText(dateStr, cx, cy + radius + 64)
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
