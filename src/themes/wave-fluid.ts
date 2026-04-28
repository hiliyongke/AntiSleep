import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

export class WaveFluidRenderer implements ThemeRenderer {
  readonly id = 'wave-fluid' as const
  readonly name = '流体波纹'
  readonly category = 'nature' as const
  readonly thumbnail = ''
  readonly defaultColor = '#00D4AA'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private time = 0
  private waves: { amplitude: number; frequency: number; speed: number; phase: number; yOffset: number }[] = []
  private ripples: { x: number; y: number; radius: number; maxRadius: number; alpha: number; speed: number }[] = []
  private mouseX = -1
  private mouseY = -1
  private prevMouseX = -1
  private prevMouseY = -1

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetWaves()
    canvas.addEventListener('mousemove', this.handleMouseMove)
    canvas.addEventListener('mouseleave', this.handleMouseLeave)
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.mouseX = e.clientX
    this.mouseY = e.clientY

    // Spawn ripple on movement
    if (this.prevMouseX >= 0 && Math.random() < 0.3) {
      this.ripples.push({
        x: this.mouseX,
        y: this.mouseY,
        radius: 0,
        maxRadius: 30 + Math.random() * 50,
        alpha: 0.4 + Math.random() * 0.3,
        speed: 40 + Math.random() * 30,
      })
    }
  }

  private handleMouseLeave = () => {
    this.mouseX = -1
    this.mouseY = -1
    this.prevMouseX = -1
    this.prevMouseY = -1
  }

  private resetWaves(): void {
    const count = this.config?.density === 'low' ? 5 : this.config?.density === 'high' ? 12 : 8
    this.waves = Array.from({ length: count }, (_, i) => ({
      amplitude: 15 + Math.random() * 35,
      frequency: 0.003 + Math.random() * 0.005,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      yOffset: 0.2 + (i / count) * 0.7,
    }))
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    const color = this.config.customColor || this.defaultColor
    this.time += deltaTime * speed

    // Deep ocean background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    bgGrad.addColorStop(0, '#000814')
    bgGrad.addColorStop(0.5, '#001d3d')
    bgGrad.addColorStop(1, '#003566')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const w = this.canvas.width
    const h = this.canvas.height

    // Draw waves from back to front
    for (let wi = 0; wi < this.waves.length; wi++) {
      const wave = this.waves[wi]
      const baseY = wave.yOffset * h
      const progress = wi / this.waves.length

      ctx.beginPath()
      for (let x = 0; x <= w; x += 3) {
        const y = baseY +
          Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude +
          Math.sin(x * wave.frequency * 2.5 + this.time * wave.speed * 0.7) * wave.amplitude * 0.3
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()

      // Wave color with depth
      const alpha = 0.08 + progress * 0.18
      const waveGrad = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, h)
      waveGrad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
      waveGrad.addColorStop(0.5, color + Math.round(alpha * 0.5 * 255).toString(16).padStart(2, '0'))
      waveGrad.addColorStop(1, color + '10')
      ctx.fillStyle = waveGrad
      ctx.fill()

      // Wave crest line
      ctx.beginPath()
      for (let x = 0; x <= w; x += 3) {
        const y = baseY +
          Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude +
          Math.sin(x * wave.frequency * 2.5 + this.time * wave.speed * 0.7) * wave.amplitude * 0.3
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color + Math.round((0.2 + progress * 0.3) * 255).toString(16).padStart(2, '0')
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Update and draw ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i]
      r.radius += r.speed * deltaTime * speed
      r.alpha -= deltaTime * speed * 0.5

      if (r.alpha <= 0) {
        this.ripples.splice(i, 1)
        continue
      }

      for (let ring = 0; ring < 2; ring++) {
        const ringR = r.radius - ring * 4
        if (ringR <= 0) continue
        ctx.beginPath()
        ctx.arc(r.x, r.y, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = color + Math.round(r.alpha * (1 - ring * 0.4) * 255).toString(16).padStart(2, '0')
        ctx.lineWidth = 2 - ring
        ctx.stroke()
      }
    }

    // Sparkle particles on wave crests
    const sparkleCount = this.config?.density === 'low' ? 15 : this.config?.density === 'high' ? 50 : 30
    for (let i = 0; i < sparkleCount; i++) {
      const x = (i / sparkleCount) * w + Math.sin(this.time + i) * 20
      const wave = this.waves[i % this.waves.length]
      const baseY = wave.yOffset * h
      const y = baseY +
        Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude
      const sparkle = 0.5 + 0.5 * Math.sin(this.time * 3 + i * 1.5)
      const size = 0.5 + sparkle * 2

      ctx.beginPath()
      ctx.arc(x, y - 3, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkle * 0.6})`
      ctx.fill()
    }
  }

  resize(): void {
    this.resetWaves()
  }

  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove)
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
    }
    this.waves = []
    this.ripples = []
    this.ctx = null
    this.canvas = null
  }
}
