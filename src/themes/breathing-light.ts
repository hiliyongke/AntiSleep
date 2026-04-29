import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Floater {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
  speed: number
}

interface HaloArc {
  radius: number
  width: number
  speed: number
  phase: number
}

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
  private floaters: Floater[] = []
  private arcs: HaloArc[] = []

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetFloaters()
  }

  private resetFloaters(): void {
    this.floaters = Array.from({ length: 24 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: 0.003 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.5,
    }))

    this.arcs = Array.from({ length: 4 }, (_, i) => ({
      radius: 0.16 + i * 0.08,
      width: 0.012 + i * 0.003,
      speed: 0.5 + i * 0.12,
      phase: Math.random() * Math.PI * 2,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const color = this.config.customColor || this.defaultColor

    // Core time: always moves at a reasonable pace, speed only tweaks it slightly
    const speed = 0.6 + this.config.speed * 0.6
    this.time += deltaTime * speed

    const w = this.canvas.width
    const h = this.canvas.height
    const cx = w / 2
    const cy = h / 2
    const minDim = Math.min(w, h)

    ctx.clearRect(0, 0, w, h)

    // Dark radial vignette background
    const vignette = ctx.createRadialGradient(cx, cy, minDim * 0.1, cx, cy, minDim * 0.9)
    vignette.addColorStop(0, color + '08')
    vignette.addColorStop(1, 'transparent')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, w, h)

    // --- Breathing core ---
    // Use two overlapping sine waves for organic, non-repetitive breathing
    const breath1 = Math.sin(this.time * 1.2)
    const breath2 = Math.sin(this.time * 0.7 + 1.3)
    const breath = 0.65 + 0.35 * (breath1 * 0.7 + breath2 * 0.3) // 0.3 ~ 1.0

    const baseRadius = minDim * 0.08 * breath

    // Outer soft glow layers (no ugly rings, just smooth radial gradients)
    for (let i = 8; i >= 1; i--) {
      const glowR = baseRadius * (1 + i * 0.9)
      const alpha = 0.06 * (9 - i) / 8
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(cx, cy, baseRadius * 0.3, cx, cy, glowR)
      grad.addColorStop(0, color + this.alphaHex(alpha))
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Main orb body — soft gradient from theme color, no harsh white
    ctx.beginPath()
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2)
    const coreGrad = ctx.createRadialGradient(cx, cy - baseRadius * 0.15, 0, cx, cy, baseRadius)
    coreGrad.addColorStop(0, color + 'BB')
    coreGrad.addColorStop(0.35, color + '99')
    coreGrad.addColorStop(0.75, color + '44')
    coreGrad.addColorStop(1, color + '10')
    ctx.fillStyle = coreGrad
    ctx.fill()

    // Subtle inner highlight (much softer)
    const highlightR = baseRadius * 0.25 * (0.8 + 0.2 * breath1)
    ctx.beginPath()
    ctx.arc(cx - baseRadius * 0.1, cy - baseRadius * 0.1, highlightR, 0, Math.PI * 2)
    ctx.fillStyle = color + '40'
    ctx.fill()

    // --- Pulse ring: one elegant expanding ring that fades out ---
    const pulseCycle = 3.5 // seconds per pulse
    const pulseT = (this.time % pulseCycle) / pulseCycle
    const pulseR = minDim * (0.08 + pulseT * 0.35)
    const pulseAlpha = Math.max(0, 1 - pulseT * pulseT) * 0.35

    if (pulseAlpha > 0.005) {
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = color + this.alphaHex(pulseAlpha)
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Soft glow around the pulse ring
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      const pulseGrad = ctx.createRadialGradient(cx, cy, pulseR - 8, cx, cy, pulseR + 12)
      pulseGrad.addColorStop(0, color + '00')
      pulseGrad.addColorStop(0.5, color + this.alphaHex(pulseAlpha * 0.5))
      pulseGrad.addColorStop(1, color + '00')
      ctx.strokeStyle = pulseGrad
      ctx.lineWidth = 6
      ctx.stroke()
    }

    for (const arc of this.arcs) {
      const start = this.time * arc.speed + arc.phase
      const end = start + Math.PI * (0.7 + 0.2 * Math.sin(this.time + arc.phase))
      ctx.beginPath()
      ctx.arc(cx, cy, minDim * arc.radius, start, end)
      ctx.strokeStyle = color + this.alphaHex(0.14)
      ctx.lineWidth = minDim * arc.width
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // --- Floating ambient particles ---
    const density = this.config.density === 'low' ? 12 : this.config.density === 'high' ? 36 : 24
    for (let i = 0; i < Math.min(this.floaters.length, density); i++) {
      const f = this.floaters[i]

      // Drift
      f.x += f.vx * deltaTime * speed
      f.y += f.vy * deltaTime * speed

      // Wrap around center-relative coords
      if (f.x < -1.2) f.x = 1.2
      if (f.x > 1.2) f.x = -1.2
      if (f.y < -1.2) f.y = 1.2
      if (f.y > 1.2) f.y = -1.2

      const px = cx + f.x * minDim * 0.5
      const py = cy + f.y * minDim * 0.5

      // Breathing: size and alpha pulse together organically
      const breathe = 0.5 + 0.5 * Math.sin(this.time * f.speed + f.phase)
      const breathe2 = 0.5 + 0.5 * Math.sin(this.time * f.speed * 0.6 + f.phase + 1.7)
      const combinedBreathe = 0.35 + 0.65 * (breathe * 0.6 + breathe2 * 0.4)

      const pSize = Math.max(0.5, f.size * minDim * combinedBreathe)
      const pAlpha = combinedBreathe

      // Soft glow
      ctx.beginPath()
      ctx.arc(px, py, pSize * 5, 0, Math.PI * 2)
      const fGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 5)
      fGrad.addColorStop(0, color + this.alphaHex(0.22 * pAlpha))
      fGrad.addColorStop(1, color + '00')
      ctx.fillStyle = fGrad
      ctx.fill()

      // Medium glow
      ctx.beginPath()
      ctx.arc(px, py, pSize * 2, 0, Math.PI * 2)
      const mGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 2)
      mGrad.addColorStop(0, color + this.alphaHex(0.45 * pAlpha))
      mGrad.addColorStop(1, color + '00')
      ctx.fillStyle = mGrad
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.arc(px, py, pSize, 0, Math.PI * 2)
      ctx.fillStyle = color + this.alphaHex(0.75 * pAlpha)
      ctx.fill()
    }

    // --- Occasional spark from center ---
    if (Math.random() < 0.03 * speed) {
      const angle = Math.random() * Math.PI * 2
      const dist = minDim * (0.05 + Math.random() * 0.25)
      const sx = cx + Math.cos(angle) * dist
      const sy = cy + Math.sin(angle) * dist
      const sSize = 0.5 + Math.random() * 2

      ctx.beginPath()
      ctx.arc(sx, sy, sSize, 0, Math.PI * 2)
      const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sSize * 4)
      sGrad.addColorStop(0, '#FFFFFF' + 'AA')
      sGrad.addColorStop(0.5, color + '66')
      sGrad.addColorStop(1, color + '00')
      ctx.fillStyle = sGrad
      ctx.fill()
    }
  }

  private alphaHex(a: number): string {
    return Math.round(Math.max(0, Math.min(1, a)) * 255)
      .toString(16)
      .padStart(2, '0')
  }

  resize(): void {
    this.resetFloaters()
  }

  destroy(): void {
    this.floaters = []
    this.arcs = []
    this.ctx = null
    this.canvas = null
  }
}
