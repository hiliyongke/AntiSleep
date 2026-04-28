import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

export class BreathingLightRenderer implements ThemeRenderer {
  readonly id = 'breathing-light' as const
  readonly name = '呼吸灯'
  readonly category = 'minimal' as const
  readonly thumbnail = ''
  readonly defaultColor = '#D83B01'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private time = 0

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const color = this.config.customColor || this.defaultColor
    const cx = this.canvas.width / 2
    const cy = this.canvas.height / 2
    const baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.12

    // Breathing cycle: scale 1.0 -> 1.3 -> 1.0
    const breath = 1 + 0.3 * Math.sin(this.time * 1.2)
    const radius = baseRadius * breath

    // Outer glow layers
    for (let i = 4; i >= 0; i--) {
      const glowRadius = radius * (1 + i * 0.6)
      const alpha = 0.03 * (5 - i) / 5
      ctx.beginPath()
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, glowRadius)
      grad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Core circle
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    coreGrad.addColorStop(0, '#FFFFFF' + 'CC')
    coreGrad.addColorStop(0.3, color + 'AA')
    coreGrad.addColorStop(1, color + '44')
    ctx.fillStyle = coreGrad
    ctx.fill()
  }

  resize(width: number, height: number): void {}

  destroy(): void {
    this.ctx = null
    this.canvas = null
  }
}
