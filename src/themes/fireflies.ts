import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  pulsePhase: number
  color: string
  trail: { x: number; y: number; alpha: number }[]
  orbit: number
}

interface MistPatch {
  x: number
  y: number
  radius: number
  driftX: number
  driftY: number
  alpha: number
}

export class FirefliesRenderer implements ThemeRenderer {
  readonly id = 'fireflies' as const
  readonly name = '萤火之森'
  readonly category = 'nature' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FFD700'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private fireflies: Firefly[] = []
  private mist: MistPatch[] = []
  private time = 0
  private mouseX = -1000
  private mouseY = -1000

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetFireflies()
    canvas.addEventListener('mousemove', this.handleMouseMove)
    canvas.addEventListener('mouseleave', this.handleMouseLeave)
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.mouseX = e.clientX
    this.mouseY = e.clientY
  }

  private handleMouseLeave = () => {
    this.mouseX = -1000
    this.mouseY = -1000
  }

  private resetFireflies(): void {
    if (!this.canvas) return
    const count = this.config?.density === 'low' ? 40 : this.config?.density === 'high' ? 120 : 70
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FFE4B5', '#FFF8DC']
    this.fireflies = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 0.8 - 0.3,
      size: 1.5 + Math.random() * 4,
      alpha: Math.random(),
      targetAlpha: 0.3 + Math.random() * 0.7,
      pulseSpeed: 0.8 + Math.random() * 2.5,
      pulsePhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: [],
      orbit: 6 + Math.random() * 20,
    }))

    const mistCount = this.config?.density === 'low' ? 3 : this.config?.density === 'high' ? 7 : 5
    this.mist = Array.from({ length: mistCount }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      radius: 80 + Math.random() * 180,
      driftX: (Math.random() - 0.5) * 4,
      driftY: (Math.random() - 0.5) * 3,
      alpha: 0.018 + Math.random() * 0.03,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed

    // Very slow trail for dreamy effect
    ctx.fillStyle = 'rgba(2, 6, 12, 0.08)'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (const mist of this.mist) {
      mist.x += mist.driftX * deltaTime * speed
      mist.y += mist.driftY * deltaTime * speed
      if (mist.x < -mist.radius) mist.x = this.canvas.width + mist.radius
      if (mist.x > this.canvas.width + mist.radius) mist.x = -mist.radius
      if (mist.y < -mist.radius) mist.y = this.canvas.height + mist.radius
      if (mist.y > this.canvas.height + mist.radius) mist.y = -mist.radius

      const grad = ctx.createRadialGradient(mist.x, mist.y, 0, mist.x, mist.y, mist.radius)
      grad.addColorStop(0, `rgba(255, 225, 140, ${mist.alpha})`)
      grad.addColorStop(1, 'rgba(255, 225, 140, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(mist.x - mist.radius, mist.y - mist.radius, mist.radius * 2, mist.radius * 2)
    }

    for (const f of this.fireflies) {
      // Mouse repulsion
      const dx = f.x - this.mouseX
      const dy = f.y - this.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120 * 3
        f.vx += (dx / dist) * force * deltaTime
        f.vy += (dy / dist) * force * deltaTime
      }

      // Gentle floating motion with sine wave
      f.vx += Math.sin(this.time * 0.5 + f.pulsePhase) * 0.02
      f.vy += Math.cos(this.time * 0.3 + f.pulsePhase) * 0.015
      f.vx += Math.cos(this.time * 0.7 + f.pulsePhase) * 0.0015 * f.orbit
      f.vy += Math.sin(this.time * 0.8 + f.pulsePhase) * 0.0015 * f.orbit

      // Damping
      f.vx *= 0.995
      f.vy *= 0.995

      f.x += f.vx * speed * deltaTime * 60
      f.y += f.vy * speed * deltaTime * 60

      // Wrap around
      if (f.x < -20) f.x = this.canvas.width + 20
      if (f.x > this.canvas.width + 20) f.x = -20
      if (f.y < -20) f.y = this.canvas.height + 20
      if (f.y > this.canvas.height + 20) f.y = -20

      // Alpha breathing
      const breathe = 0.5 + 0.5 * Math.sin(this.time * f.pulseSpeed + f.pulsePhase)
      f.alpha = f.targetAlpha * breathe

      // Record trail
      f.trail.push({ x: f.x, y: f.y, alpha: f.alpha })
      if (f.trail.length > 12) f.trail.shift()

      // Draw trail
      for (let t = 1; t < f.trail.length; t++) {
        const p1 = f.trail[t - 1]
        const p2 = f.trail[t]
        const trailAlpha = (t / f.trail.length) * p2.alpha * 0.25
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = f.color + Math.round(trailAlpha * 255).toString(16).padStart(2, '0')
        ctx.lineWidth = f.size * 0.4 * (t / f.trail.length)
        ctx.stroke()
      }

      // Outer glow
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.size * 8, 0, Math.PI * 2)
      const outerGrad = ctx.createRadialGradient(f.x, f.y, f.size * 0.5, f.x, f.y, f.size * 8)
      outerGrad.addColorStop(0, f.color + Math.round(f.alpha * 0.15 * 255).toString(16).padStart(2, '0'))
      outerGrad.addColorStop(1, f.color + '00')
      ctx.fillStyle = outerGrad
      ctx.fill()

      // Middle glow
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2)
      const midGrad = ctx.createRadialGradient(f.x, f.y, f.size * 0.3, f.x, f.y, f.size * 3)
      midGrad.addColorStop(0, f.color + Math.round(f.alpha * 0.5 * 255).toString(16).padStart(2, '0'))
      midGrad.addColorStop(1, f.color + '00')
      ctx.fillStyle = midGrad
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
      ctx.fillStyle = f.color + Math.round(f.alpha * 255).toString(16).padStart(2, '0')
      ctx.fill()

      // Bright center
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.size * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha * 0.9})`
      ctx.fill()
    }
  }

  resize(): void {
    this.resetFireflies()
  }

  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove)
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
    }
    this.fireflies = []
    this.mist = []
    this.ctx = null
    this.canvas = null
  }
}
