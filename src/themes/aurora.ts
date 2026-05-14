import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

/**
 * 极光效果 - 模拟真实极光的流动光带
 * 使用 Perlin 噪声生成自然波浪，多层发光模拟极光立体感
 */
export class AuroraRenderer implements ThemeRenderer {
  readonly id = 'aurora' as const
  readonly name = '极光'
  readonly category = 'nature' as const
  readonly thumbnail = ''
  readonly defaultColor = '#00FF88'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private time = 0
  private bands: AuroraBand[] = []
  private stars: Star[] = []
  // 用于噪声的排列表
  private readonly perm = this.buildPermTable()

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.generateStars()
    this.generateBands()
  }

  private generateStars(): void {
    const count = this.config?.density === 'low' ? 80 : this.config?.density === 'high' ? 250 : 150
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      radius: 0.4 + Math.random() * 1.5,
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))
  }

  private generateBands(): void {
    const baseColor = this.config?.customColor || this.defaultColor
    const count = this.config?.density === 'low' ? 2 : this.config?.density === 'high' ? 5 : 3

    const colors = this.generateAuroraColors(baseColor, count)

    this.bands = colors.map((color, i) => ({
      color,
      baseY: 0.05 + i * 0.15,
      height: 0.18 + Math.random() * 0.25,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * 1000,
      amplitude: 0.02 + Math.random() * 0.04,
      opacity: 0.35 + Math.random() * 0.45,
    }))
  }

  /**
   * 从主色生成极光色系
   */
  private generateAuroraColors(baseColor: string, count: number): string[] {
    const rgb = this.hexToRgb(baseColor)
    const colors: string[] = [baseColor]

    // 生成互补色和邻近色
    for (let i = 1; i < count; i++) {
      const shift = (i % 2 === 0 ? 1 : -1) * (30 + i * 25)
      colors.push(this.shiftColorRgb(rgb, shift, 0.85 + i * 0.05))
    }
    return colors
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 255, b: 136 }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  /**
   * 移动 RGB 色相 (简化版，通过调节 RGB 通道模拟)
   */
  private shiftColorRgb(rgb: { r: number; g: number; b: number }, hueShift: number, brightness: number): string {
    const { r, g, b } = rgb
    let newR = r, newG = g, newB = b

    // 简化的色相偏移: 循环移位 RGB 通道
    const factor = Math.abs(hueShift) / 60 // 归一化
    if (hueShift > 0) {
      // 向青/蓝偏移: R->G->B
      newR = r * (1 - factor * 0.5)
      newG = g + (b - g) * factor * 0.3
      newB = b * (1 + factor * 0.2)
    } else {
      // 向黄/红偏移: B->G->R
      newB = b * (1 - factor * 0.5)
      newG = g + (r - g) * factor * 0.3
      newR = r * (1 + factor * 0.2)
    }

    newR *= brightness
    newG *= brightness
    newB *= brightness

    return this.rgbToHex(newR, newG, newB)
  }

  /**
   * 构建 Perlin 噪声排列表
   */
  private buildPermTable(): number[] {
    const p: number[] = []
    for (let i = 0; i < 256; i++) p[i] = i
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    return [...p, ...p]
  }

  /**
   * 柏林噪声 (简化版)
   */
  private perlinNoise(x: number, t: number): number {
    const xi = Math.floor(x) & 255
    const ti = Math.floor(t) & 255
    const xf = x - Math.floor(x)
    const tf = t - Math.floor(t)

    const u = this.fade(xf)
    const v = this.fade(tf)

    const aa = this.perm[this.perm[xi] + ti]
    const ab = this.perm[this.perm[xi] + ti + 1]
    const ba = this.perm[this.perm[xi + 1] + ti]
    const bb = this.perm[this.perm[xi + 1] + ti + 1]

    const x1 = this.lerp(v, this.grad(aa, xf, tf), this.grad(ab, xf, tf - 1))
    const x2 = this.lerp(v, this.grad(ba, xf - 1, tf), this.grad(bb, xf - 1, tf - 1))

    return this.lerp(u, x1, x2)
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  /**
   * 分形噪声 (多个倍频叠加)
   */
  private fbm(x: number, t: number, octaves: number): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxVal = 0

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.perlinNoise(x * frequency, t * frequency)
      maxVal += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return value / maxVal
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    const speed = 0.3 + this.config.speed * 0.4
    this.time += deltaTime * speed

    // ── 夜空背景 ──
    this.drawSky(ctx, w, h)

    // ── 星星 ──
    this.drawStars(ctx, w, h)

    // ── 极光光带 (从后往前绘制) ──
    for (let i = 0; i < this.bands.length; i++) {
      this.drawAuroraBand(ctx, w, h, this.bands[i], i)
    }

    // ── 底部山脉/森林剪影 ──
    this.drawSilhouette(ctx, w, h)
  }

  private drawSky(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#010510')  // 近黑深蓝
    grad.addColorStop(0.3, '#020a18') // 深蓝
    grad.addColorStop(0.6, '#040e1e') // 稍亮
    grad.addColorStop(1, '#081428')    // 底部微亮（反光）
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  private drawStars(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save()
    for (const star of this.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset)
      const alpha = star.brightness * (0.4 + 0.6 * twinkle)

      // 星星主体
      ctx.beginPath()
      ctx.arc(star.x * w, star.y * h, star.radius * (w / 1000), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`
      ctx.fill()

      // 亮星加十字光芒
      if (star.brightness > 0.65) {
        ctx.save()
        ctx.globalAlpha = alpha * 0.4
        ctx.strokeStyle = 'rgba(200, 220, 255, 1)'
        ctx.lineWidth = 0.6 * (w / 1000)
        const sx = star.x * w
        const sy = star.y * h
        const len = star.radius * (w / 1000) * 4
        ctx.beginPath()
        ctx.moveTo(sx - len, sy)
        ctx.lineTo(sx + len, sy)
        ctx.moveTo(sx, sy - len)
        ctx.lineTo(sx, sy + len)
        ctx.stroke()
        ctx.restore()
      }
    }
    ctx.restore()
  }

  private drawAuroraBand(ctx: CanvasRenderingContext2D, w: number, h: number, band: AuroraBand, index: number): void {
    const t = this.time * band.speed + band.phase
    const baseY = band.baseY * h
    const bandH = band.height * h

    // 使用多层叠加创建发光效果
    const layers: { scaleY: number; alpha: number; blur: number }[] = [
      { scaleY: 1.8, alpha: 0.06, blur: 40 },  // 外层大辉光
      { scaleY: 1.3, alpha: 0.12, blur: 20 },  // 中层辉光
      { scaleY: 0.9, alpha: 0.2, blur: 10 },   // 内层中辉光
      { scaleY: 0.5, alpha: 0.35, blur: 4 },   // 核心亮层
    ]

    for (const layer of layers) {
      ctx.save()
      ctx.globalAlpha = layer.alpha * band.opacity

      const points: { x: number; y: number }[] = []
      const step = 3

      for (let x = 0; x <= w; x += step) {
        const nx = x * 0.003 + t * 0.3
        const nt = t * 0.5

        // 使用分形噪声创建自然波浪
        const noise = this.fbm(nx, nt, 4)
        const y = baseY + noise * band.amplitude * h * layer.scaleY

        points.push({ x, y })
      }

      // 创建光带形状
      ctx.beginPath()
      // 上边缘
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cpx = (prev.x + curr.x) / 2
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2)
      }

      // 下边缘 (更宽更透明)
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i]
        const ly = p.y + bandH * layer.scaleY * 0.7
        if (i === points.length - 1) {
          ctx.lineTo(p.x, ly)
        } else {
          const next = points[i + 1]
          const cpx = (p.x + next.x) / 2
          ctx.quadraticCurveTo(p.x, ly, cpx, (ly + (next.y + bandH * layer.scaleY * 0.7)) / 2)
        }
      }

      ctx.closePath()

      // 颜色渐变
      const rgb = this.hexToRgb(band.color)
      const innerRGB = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, `
      const grad = ctx.createLinearGradient(0, baseY - bandH * 0.3, 0, baseY + bandH * 1.2)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(0.2, innerRGB + '0.05)')
      grad.addColorStop(0.5, innerRGB + '0.8)')
      grad.addColorStop(0.8, innerRGB + '0.15)')
      grad.addColorStop(1, 'transparent')

      ctx.fillStyle = grad
      ctx.filter = `blur(${layer.blur}px)`
      ctx.fill()
      ctx.restore()
    }

    // 核心亮线 (最亮部分)
    ctx.save()
    ctx.globalAlpha = 0.5 * band.opacity
    const corePoints: { x: number; y: number }[] = []
    const coreStep = 2
    for (let x = 0; x <= w; x += coreStep) {
      const noise = this.fbm(x * 0.003 + t * 0.3, t * 0.5, 4)
      const y = baseY + noise * band.amplitude * h * 0.5
      corePoints.push({ x, y })
    }

    ctx.beginPath()
    ctx.moveTo(corePoints[0].x, corePoints[0].y)
    for (let i = 1; i < corePoints.length; i++) {
      const prev = corePoints[i - 1]
      const curr = corePoints[i]
      const cpx = (prev.x + curr.x) / 2
      const cpy = (prev.y + curr.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy)
    }

    const rgb = this.hexToRgb(band.color)
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
    ctx.lineWidth = 2.5 * (w / 1000)
    ctx.shadowColor = band.color
    ctx.shadowBlur = 20 * (w / 1000)
    ctx.stroke()
    ctx.restore()

    // 流动光点
    this.drawTravelingSparkles(ctx, w, h, band, t)
  }

  /**
   * 绘制流动的光点 (极光中的动态亮点)
   */
  private drawTravelingSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, band: AuroraBand, t: number): void {
    const baseY = band.baseY * h
    const numSparkles = 2

    for (let i = 0; i < numSparkles; i++) {
      const progress = ((t * 0.08 + i * 0.5) % 1)
      const sx = progress * w
      const noise = this.fbm(sx * 0.003 + t * 0.3, t * 0.5, 3)
      const sy = baseY + noise * band.amplitude * h * 0.5

      ctx.save()
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3 + i)

      const glowR = 15 + Math.sin(t + i) * 8
      const rgb = this.hexToRgb(band.color)

      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR * (w / 1000))
      grad.addColorStop(0, `rgba(255, 255, 255, 0.8)`)
      grad.addColorStop(0.2, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`)
      grad.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`)
      grad.addColorStop(1, 'transparent')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(sx, sy, glowR * (w / 1000), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  /**
   * 绘制底部剪影 (山脉/森林)
   */
  private drawSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const silHeight = h * 0.12
    const baseY = h - silHeight

    ctx.save()
    ctx.fillStyle = '#000308'

    // 使用噪声生成自然山脉轮廓
    ctx.beginPath()
    ctx.moveTo(0, h)

    const step = 5
    for (let x = 0; x <= w; x += step) {
      // 使用多个正弦波叠加模拟山脉
      const mountain = 
        Math.sin(x * 0.002) * silHeight * 0.4 +
        Math.sin(x * 0.005 + 1) * silHeight * 0.25 +
        Math.sin(x * 0.001 - 2) * silHeight * 0.35 +
        Math.sin(x * 0.01 + 3) * silHeight * 0.08

      const y = baseY + Math.max(0, mountain)
      ctx.lineTo(x, y)
    }

    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    // 第二层更暗的山脉
    ctx.fillStyle = '#000205'
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += step) {
      const mountain = 
        Math.sin(x * 0.0015 + 2) * silHeight * 0.3 +
        Math.sin(x * 0.004 + 0.5) * silHeight * 0.2 +
        Math.sin(x * 0.008 + 1.5) * silHeight * 0.06
      const y = baseY + silHeight * 0.3 + Math.max(0, mountain)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  resize(): void {
    this.generateStars()
    this.generateBands()
  }

  destroy(): void {
    this.bands = []
    this.stars = []
    this.ctx = null
    this.canvas = null
  }
}

interface AuroraBand {
  color: string
  baseY: number
  height: number
  speed: number
  phase: number
  amplitude: number
  opacity: number
}

interface Star {
  x: number
  y: number
  radius: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
}
