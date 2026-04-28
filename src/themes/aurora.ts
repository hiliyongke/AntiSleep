import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface AuroraBand {
  baseY: number
  amplitude: number
  freqX: number
  freqY: number
  phase: number
  driftSpeed: number
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
  private config: ThemeConfig | null = null
  private time = 0
  private bands: AuroraBand[] = []

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetBands()
  }

  private resetBands(): void {
    const baseColor = this.config?.customColor || this.defaultColor
    const rgb = this.hexToRgb(baseColor)

    const colors = [
      baseColor,
      this.shiftHue(rgb, 35),
      this.shiftHue(rgb, -35),
      this.shiftHue(rgb, 70),
      this.shiftHue(rgb, -70),
    ]

    const count = this.config?.density === 'low' ? 3 : this.config?.density === 'high' ? 7 : 5
    this.bands = Array.from({ length: count }, (_, i) => ({
      baseY: 0.15 + i * 0.1,
      amplitude: 40 + Math.random() * 60,
      freqX: 0.008 + Math.random() * 0.012,
      freqY: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      driftSpeed: 0.6 + Math.random() * 1.0,
      color: colors[i % colors.length],
      width: 50 + Math.random() * 80,
    }))
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 22, g: 198, b: 12 }
  }

  private shiftHue(rgb: { r: number; g: number; b: number }, shift: number): string {
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    hsl.h = (hsl.h + shift / 360) % 1
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
    return `rgb(${Math.round(newRgb.r)}, ${Math.round(newRgb.g)}, ${Math.round(newRgb.b)})`
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return { h, s, l }
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    let r = l, g = l, b = l
    if (s !== 0) {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = this.hueToRgb(p, q, h + 1 / 3)
      g = this.hueToRgb(p, q, h)
      b = this.hueToRgb(p, q, h - 1 / 3)
    }
    return { r: r * 255, g: g * 255, b: b * 255 }
  }

  private hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    // Time always moves at a good pace
    const speed = 0.7 + this.config.speed * 0.6
    this.time += deltaTime * speed

    // Dark sky background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
    skyGrad.addColorStop(0, '#02040a')
    skyGrad.addColorStop(0.5, '#030a14')
    skyGrad.addColorStop(1, '#061428')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, h)

    // Draw aurora bands back to front
    for (const band of this.bands) {
      const t = this.time
      const centerY = band.baseY * h + Math.sin(t * band.driftSpeed * 0.3 + band.phase) * h * 0.06

      // Build wave points
      const points: { x: number; y: number }[] = []
      const step = 3
      for (let x = 0; x <= w; x += step) {
        // Horizontal wave: flows left/right as time changes
        const waveX = Math.sin(x * band.freqX + t * band.driftSpeed + band.phase) * band.amplitude
        // Secondary ripple
        const waveX2 = Math.sin(x * band.freqX * 1.7 + t * band.driftSpeed * 0.8 + band.phase * 1.3) * band.amplitude * 0.35
        // Vertical breathing
        const waveY = Math.sin(t * band.driftSpeed * 0.5 + x * band.freqY) * band.amplitude * 0.25

        points.push({ x, y: centerY + waveX + waveX2 + waveY })
      }

      // Draw soft glow layers
      for (let layer = 0; layer < 3; layer++) {
        const lw = band.width * (1 + layer * 0.6)
        const la = layer === 0 ? 0.3 : layer === 1 ? 0.15 : 0.06

        ctx.beginPath()
        for (let i = 0; i < points.length; i++) {
          const p = points[i]
          if (i === 0) ctx.moveTo(p.x, p.y - lw / 2)
          else ctx.lineTo(p.x, p.y - lw / 2)
        }
        for (let i = points.length - 1; i >= 0; i--) {
          const p = points[i]
          ctx.lineTo(p.x, p.y + lw / 2)
        }
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, centerY - lw, 0, centerY + lw)
        grad.addColorStop(0, band.color + '00')
        grad.addColorStop(0.2, band.color + this.alphaHex(la * 0.5))
        grad.addColorStop(0.5, band.color + this.alphaHex(la))
        grad.addColorStop(0.8, band.color + this.alphaHex(la * 0.5))
        grad.addColorStop(1, band.color + '00')
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Animated bright core line
      const lineAlpha = 0.5 + 0.3 * Math.sin(t * band.driftSpeed + band.phase)

      // Outer glow line
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.strokeStyle = band.color + this.alphaHex(lineAlpha * 0.35)
      ctx.lineWidth = 4
      ctx.stroke()

      // Inner bright line
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.strokeStyle = band.color + this.alphaHex(lineAlpha * 0.7)
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Traveling highlight along the wave
      const travelPos = (t * band.driftSpeed * 40) % w
      // Find closest point
      let closestIdx = 0
      let closestDist = Infinity
      for (let i = 0; i < points.length; i++) {
        const d = Math.abs(points[i].x - travelPos)
        if (d < closestDist) {
          closestDist = d
          closestIdx = i
        }
      }
      const tp = points[closestIdx]
      const glowR = 8 + band.width * 0.08

      ctx.beginPath()
      ctx.arc(tp.x, tp.y, glowR * 2, 0, Math.PI * 2)
      const tGrad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, glowR * 2)
      tGrad.addColorStop(0, '#FFFFFF' + this.alphaHex(lineAlpha * 0.5))
      tGrad.addColorStop(0.5, band.color + this.alphaHex(lineAlpha * 0.3))
      tGrad.addColorStop(1, band.color + '00')
      ctx.fillStyle = tGrad
      ctx.fill()
    }
  }

  private alphaHex(a: number): string {
    return Math.round(Math.max(0, Math.min(1, a)) * 255)
      .toString(16)
      .padStart(2, '0')
  }

  resize(): void {
    this.resetBands()
  }

  destroy(): void {
    this.bands = []
    this.ctx = null
    this.canvas = null
  }
}
