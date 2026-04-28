import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

export class ClockRenderer implements ThemeRenderer {
  readonly id = 'clock' as const
  readonly name = '时钟'
  readonly category = 'minimal' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FFFFFF'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const color = this.config.customColor || this.defaultColor

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const cx = this.canvas.width / 2
    const cy = this.canvas.height / 2
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.25

    const now = new Date()
    const hours = now.getHours() % 12
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const ms = now.getMilliseconds()
    const smoothSeconds = seconds + ms / 1000

    // Draw clock face ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = color + '20'
    ctx.lineWidth = 2
    ctx.stroke()

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2
      const innerR = i % 3 === 0 ? radius - 15 : radius - 8
      const outerR = radius - 3
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
      ctx.strokeStyle = i % 3 === 0 ? color + 'AA' : color + '44'
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1
      ctx.stroke()
    }

    // Hour hand
    const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12 - Math.PI / 2
    this.drawHand(cx, cy, hourAngle, radius * 0.5, 3.5, color + 'DD')

    // Minute hand
    const minuteAngle = ((minutes + smoothSeconds / 60) * Math.PI * 2) / 60 - Math.PI / 2
    this.drawHand(cx, cy, minuteAngle, radius * 0.7, 2, color + 'BB')

    // Second hand (smooth)
    const secondAngle = (smoothSeconds * Math.PI * 2) / 60 - Math.PI / 2
    this.drawHand(cx, cy, secondAngle, radius * 0.85, 1, '#0078D4')

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#0078D4'
    ctx.fill()

    // Digital time below
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    ctx.font = `300 ${Math.max(14, radius * 0.2)}px "Segoe UI Variable", "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = color + '66'
    ctx.fillText(timeStr, cx, cy + radius + 35)
  }

  private drawHand(cx: number, cy: number, angle: number, length: number, width: number, color: string): void {
    if (!this.ctx) return
    this.ctx.beginPath()
    this.ctx.moveTo(cx, cy)
    this.ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
  }

  resize(width: number, height: number): void {}

  destroy(): void {
    this.ctx = null
    this.canvas = null
  }
}
