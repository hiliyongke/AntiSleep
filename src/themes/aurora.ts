import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface AuroraBand {
  y: number
  amplitude: number
  frequency: number
  phase: number
  speed: number
  color: string
  width: number
}

export class AuroraRenderer implements ThemeRenderer {
  readonly id = 'aurora' as const
  readonly name = '极光'
  readonly category = 'nature' as const
  readonly thumbnail = ''
  readonly defaultColor = '#16C60C'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private bands: AuroraBand[] = []
  private config: ThemeConfig | null = null
  private time = 0

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetBands()
  }

  private resetBands(): void {
    const colors = ['#16C60C', '#0078D4', '#5B2C8E', '#00B7C3']
    const count = this.config?.density === 'low' ? 3 : this.config?.density === 'high' ? 6 : 4
    this.bands = Array.from({ length: count }, (_, i) => ({
      y: 0.1 + i * 0.08,
      amplitude: 20 + Math.random() * 40,
      frequency: 0.002 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      color: colors[i % colors.length],
      width: 30 + Math.random() * 50,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const band of this.bands) {
      ctx.beginPath()
      const baseY = band.y * this.canvas.height

      // Draw aurora band with gradient
      for (let x = 0; x < this.canvas.width; x += 2) {
        const wave1 = Math.sin(x * band.frequency + this.time * band.speed + band.phase) * band.amplitude
        const wave2 = Math.sin(x * band.frequency * 0.5 + this.time * band.speed * 0.7) * band.amplitude * 0.5
        const y = baseY + wave1 + wave2

        if (x === 0) {
          ctx.moveTo(x, y - band.width / 2)
        } else {
          ctx.lineTo(x, y - band.width / 2)
        }
      }

      // Return path (bottom of band)
      for (let x = this.canvas.width; x >= 0; x -= 2) {
        const wave1 = Math.sin(x * band.frequency + this.time * band.speed + band.phase) * band.amplitude
        const wave2 = Math.sin(x * band.frequency * 0.5 + this.time * band.speed * 0.7) * band.amplitude * 0.5
        const y = baseY + wave1 + wave2
        ctx.lineTo(x, y + band.width / 2)
      }

      ctx.closePath()

      const color = this.config.customColor || band.color
      const grad = ctx.createLinearGradient(0, baseY - band.width, 0, baseY + band.width)
      grad.addColorStop(0, color + '00')
      grad.addColorStop(0.3, color + '1A')
      grad.addColorStop(0.5, color + '33')
      grad.addColorStop(0.7, color + '1A')
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fill()
    }
  }

  resize(width: number, height: number): void {
    this.resetBands()
  }

  destroy(): void {
    this.bands = []
    this.ctx = null
    this.canvas = null
  }
}
