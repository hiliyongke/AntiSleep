import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export class ParticleNetworkRenderer implements ThemeRenderer {
  readonly id = 'particle-network' as const
  readonly name = '粒子网络'
  readonly category = 'tech' as const
  readonly thumbnail = ''
  readonly defaultColor = '#0078D4'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private config: ThemeConfig | null = null
  private connectionDistance = 150

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.connectionDistance = config.density === 'low' ? 180 : config.density === 'high' ? 120 : 150
    this.resetParticles()
  }

  private resetParticles(): void {
    if (!this.canvas) return
    const count = this.config?.density === 'low' ? 40 : this.config?.density === 'high' ? 100 : 65
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 1.5 + Math.random() * 2,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    const color = this.config.customColor || this.defaultColor

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx * speed * deltaTime * 60
      p.y += p.vy * speed * deltaTime * 60

      if (p.x < 0) p.x = this.canvas.width
      if (p.x > this.canvas.width) p.x = 0
      if (p.y < 0) p.y = this.canvas.height
      if (p.y > this.canvas.height) p.y = 0
    }

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x
        const dy = this.particles[i].y - this.particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < this.connectionDistance) {
          const alpha = (1 - dist / this.connectionDistance) * 0.3
          ctx.beginPath()
          ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0')
          ctx.lineWidth = 0.5
          ctx.moveTo(this.particles[i].x, this.particles[i].y)
          ctx.lineTo(this.particles[j].x, this.particles[j].y)
          ctx.stroke()
        }
      }
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(p.x, p.y, p.radius, p.x, p.y, p.radius * 3)
      grad.addColorStop(0, color + '33')
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fill()
    }
  }

  resize(width: number, height: number): void {
    this.resetParticles()
  }

  destroy(): void {
    this.particles = []
    this.ctx = null
    this.canvas = null
  }
}
