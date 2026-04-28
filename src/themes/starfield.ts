import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Star {
  x: number
  y: number
  z: number
  size: number
  twinkleSpeed: number
  twinklePhase: number
  brightness: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  width: number
  trail: { x: number; y: number }[]
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  alpha: number
  driftX: number
  driftY: number
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
  private nebulae: Nebula[] = []
  private config: ThemeConfig | null = null
  private time = 0
  private baseColor = { r: 255, g: 255, b: 255 }

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    const color = config.customColor || this.defaultColor
    this.baseColor = this.hexToRgb(color)
    this.resetStars()
    this.resetNebulae()
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 }
  }

  private starColor(brightness: number): string {
    const tint = Math.random()
    let r = this.baseColor.r
    let g = this.baseColor.g
    let b = this.baseColor.b

    if (tint < 0.15) {
      r = Math.min(255, r * 0.85)
      g = Math.min(255, g * 0.92)
      b = Math.min(255, b * 1.08)
    } else if (tint < 0.25) {
      r = Math.min(255, r * 1.08)
      g = Math.min(255, g * 0.92)
      b = Math.min(255, b * 0.85)
    } else if (tint < 0.3) {
      r = Math.min(255, r * 1.05)
      g = Math.min(255, g * 1.02)
      b = Math.min(255, b * 0.9)
    }

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${brightness})`
  }

  private resetStars(): void {
    if (!this.canvas) return
    const count = this.config?.density === 'low' ? 150 : this.config?.density === 'high' ? 400 : 280
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      z: Math.random() * 3 + 0.3,
      size: 0.3 + Math.random() * 3,
      twinkleSpeed: 0.2 + Math.random() * 3,
      twinklePhase: Math.random() * Math.PI * 2,
      brightness: 0.15 + Math.random() * 0.85,
      color: this.starColor(1),
    }))
  }

  private resetNebulae(): void {
    if (!this.canvas) return
    const colors = [
      `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}`,
      `rgba(${Math.min(255, this.baseColor.r * 0.5)}, ${Math.min(255, this.baseColor.g * 0.6)}, ${Math.min(255, this.baseColor.b * 1.2)}`,
      `rgba(${Math.min(255, this.baseColor.r * 1.2)}, ${Math.min(255, this.baseColor.g * 0.6)}, ${Math.min(255, this.baseColor.b * 0.7)}`,
      `rgba(${Math.min(255, this.baseColor.r * 0.7)}, ${Math.min(255, this.baseColor.g * 1.1)}, ${Math.min(255, this.baseColor.b * 0.9)}`,
    ]

    this.nebulae = Array.from({ length: 5 }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      radius: 120 + Math.random() * 250,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.02 + Math.random() * 0.05,
      driftX: (Math.random() - 0.5) * 4,
      driftY: (Math.random() - 0.5) * 4,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw nebulae background
    for (const neb of this.nebulae) {
      neb.x += neb.driftX * deltaTime * speed
      neb.y += neb.driftY * deltaTime * speed

      if (neb.x < -neb.radius) neb.x = this.canvas.width + neb.radius
      if (neb.x > this.canvas.width + neb.radius) neb.x = -neb.radius
      if (neb.y < -neb.radius) neb.y = this.canvas.height + neb.radius
      if (neb.y > this.canvas.height + neb.radius) neb.y = -neb.radius

      const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius)
      grad.addColorStop(0, neb.color + `,${neb.alpha})`)
      grad.addColorStop(0.4, neb.color + `,${neb.alpha * 0.6})`)
      grad.addColorStop(0.7, neb.color + `,${neb.alpha * 0.2})`)
      grad.addColorStop(1, neb.color + ',0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // Draw stars with parallax, twinkle and glow
    for (const star of this.stars) {
      const twinkle = 0.3 + 0.7 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase)
      const alpha = star.brightness * twinkle

      // Parallax drift based on depth
      const driftX = Math.sin(this.time * 0.04 + star.twinklePhase) * star.z * 0.5
      const driftY = Math.cos(this.time * 0.025 + star.twinklePhase) * star.z * 0.3
      const sx = star.x + driftX
      const sy = star.y + driftY

      // Glow halo for all stars
      const haloRadius = star.size * (2 + star.z)
      ctx.beginPath()
      ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2)
      const haloGrad = ctx.createRadialGradient(sx, sy, star.size * 0.3, sx, sy, haloRadius)
      haloGrad.addColorStop(0, this.starColor(alpha * 0.4))
      haloGrad.addColorStop(1, this.starColor(0))
      ctx.fillStyle = haloGrad
      ctx.fill()

      // Main star
      ctx.beginPath()
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2)
      ctx.fillStyle = this.starColor(alpha)
      ctx.fill()

      // Cross glow for bright stars
      if (star.size > 1.2 && alpha > 0.5) {
        const glowLen = star.size * (4 + star.z * 2)
        const glowAlpha = alpha * 0.25
        const glowColor = this.starColor(glowAlpha)

        ctx.beginPath()
        ctx.moveTo(sx - glowLen, sy)
        ctx.lineTo(sx + glowLen, sy)
        ctx.strokeStyle = glowColor
        ctx.lineWidth = 0.5 + star.size * 0.3
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(sx, sy - glowLen)
        ctx.lineTo(sx, sy + glowLen)
        ctx.strokeStyle = glowColor
        ctx.lineWidth = 0.5 + star.size * 0.3
        ctx.stroke()
      }
    }

    // Shooting stars with curved trails and head glow
    if (Math.random() < 0.006 * speed) {
      const startSide = Math.random() < 0.5 ? 'top' : 'left'
      this.shootingStars.push({
        x: startSide === 'top' ? Math.random() * this.canvas.width : 0,
        y: startSide === 'top' ? 0 : Math.random() * this.canvas.height * 0.5,
        vx: startSide === 'top' ? -1 - Math.random() * 3 : 4 + Math.random() * 5,
        vy: startSide === 'top' ? 2.5 + Math.random() * 4 : 1.5 + Math.random() * 3,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.5,
        width: 2 + Math.random() * 2,
        trail: [],
      })
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i]

      // Record trail
      ss.trail.push({ x: ss.x, y: ss.y })
      if (ss.trail.length > 20) ss.trail.shift()

      ss.x += ss.vx * speed * deltaTime * 60
      ss.y += ss.vy * speed * deltaTime * 60
      ss.life -= deltaTime / ss.maxLife

      if (ss.life <= 0 || ss.x > this.canvas.width + 200 || ss.y > this.canvas.height + 200) {
        this.shootingStars.splice(i, 1)
        continue
      }

      const alpha = ss.life

      // Head glow
      ctx.beginPath()
      ctx.arc(ss.x, ss.y, 4, 0, Math.PI * 2)
      const headGrad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 4)
      headGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
      headGrad.addColorStop(0.5, this.starColor(alpha * 0.8))
      headGrad.addColorStop(1, this.starColor(0))
      ctx.fillStyle = headGrad
      ctx.fill()

      // Trail
      if (ss.trail.length > 1) {
        for (let t = 1; t < ss.trail.length; t++) {
          const p1 = ss.trail[t - 1]
          const p2 = ss.trail[t]
          const trailAlpha = alpha * (t / ss.trail.length) * 0.8
          const trailWidth = ss.width * (t / ss.trail.length)

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = this.starColor(trailAlpha)
          ctx.lineWidth = trailWidth
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      }
    }
  }

  resize(width: number, height: number): void {
    this.resetStars()
    this.resetNebulae()
  }

  destroy(): void {
    this.stars = []
    this.shootingStars = []
    this.nebulae = []
    this.ctx = null
    this.canvas = null
  }
}
