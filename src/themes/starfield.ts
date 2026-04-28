import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Star {
  x: number
  y: number
  size: number
  twinkleSpeed: number
  twinklePhase: number
  brightness: number
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

export class StarfieldRenderer implements ThemeRenderer {
  readonly id = 'starfield' as const
  readonly name = '星空'
  readonly category = 'nature' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FFFFFF'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private stars: Star[] = []
  private shootingStars: ShootingStar[] = []
  private config: ThemeConfig | null = null
  private time = 0

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetStars()
  }

  private resetStars(): void {
    if (!this.canvas) return
    const count = this.config?.density === 'low' ? 80 : this.config?.density === 'high' ? 250 : 150
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      size: 0.5 + Math.random() * 2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2,
      brightness: 0.3 + Math.random() * 0.7,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const color = this.config.customColor || this.defaultColor

    // Draw stars
    for (const star of this.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase)
      const alpha = star.brightness * twinkle

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0')
      ctx.fill()

      // Glow for larger stars
      if (star.size > 1.2) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(star.x, star.y, star.size, star.x, star.y, star.size * 3)
        grad.addColorStop(0, color + Math.round(alpha * 0.3 * 255).toString(16).padStart(2, '0'))
        grad.addColorStop(1, color + '00')
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    // Shooting stars
    if (Math.random() < 0.005 * speed) {
      this.shootingStars.push({
        x: Math.random() * this.canvas.width,
        y: 0,
        vx: -2 - Math.random() * 3,
        vy: 2 + Math.random() * 3,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
      })
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i]
      ss.x += ss.vx * speed * deltaTime * 60
      ss.y += ss.vy * speed * deltaTime * 60
      ss.life -= deltaTime / ss.maxLife

      if (ss.life <= 0) {
        this.shootingStars.splice(i, 1)
        continue
      }

      const alpha = ss.life
      const tailLen = 30
      ctx.beginPath()
      ctx.moveTo(ss.x, ss.y)
      ctx.lineTo(ss.x - ss.vx * tailLen / 3, ss.y - ss.vy * tailLen / 3)
      ctx.strokeStyle = color + Math.round(alpha * 200).toString(16).padStart(2, '0')
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  resize(width: number, height: number): void {
    this.resetStars()
  }

  destroy(): void {
    this.stars = []
    this.shootingStars = []
    this.ctx = null
    this.canvas = null
  }
}
