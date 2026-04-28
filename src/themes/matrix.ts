import type { ThemeRenderer } from './types'
import type { ThemeConfig, ParticleDensity } from '../types'

interface Column {
  x: number
  y: number
  speed: number
  chars: string[]
  charIndex: number
}

export class MatrixRenderer implements ThemeRenderer {
  readonly id = 'matrix' as const
  readonly name = '矩阵代码雨'
  readonly category = 'tech' as const
  readonly thumbnail = ''
  readonly defaultColor = '#16C60C'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private columns: Column[] = []
  private fontSize = 14
  private config: ThemeConfig | null = null
  private densityCount = 40

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.fontSize = config.density === 'low' ? 16 : config.density === 'high' ? 12 : 14
    this.densityCount = config.density === 'low' ? 25 : config.density === 'high' ? 60 : 40
    this.resetColumns()
  }

  private resetColumns(): void {
    if (!this.canvas) return
    const colCount = Math.floor(this.canvas.width / this.fontSize)
    this.columns = Array.from({ length: colCount }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      speed: 2 + Math.random() * 4,
      chars: this.randomChars(this.densityCount),
      charIndex: Math.floor(Math.random() * this.densityCount),
    }))
  }

  private randomChars(count: number): string[] {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコ'
    return Array.from({ length: count }, () => chars[Math.floor(Math.random() * chars.length)])
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed

    // Fade trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.font = `${this.fontSize}px monospace`

    for (const col of this.columns) {
      const char = col.chars[col.charIndex % col.chars.length]
      const color = this.config.customColor || this.defaultColor

      // Leading bright char
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(char, col.x, col.y)

      // Previous char in green
      if (col.charIndex > 0) {
        ctx.fillStyle = color
        ctx.fillText(col.chars[(col.charIndex - 1) % col.chars.length], col.x, col.y - this.fontSize)
      }

      col.y += col.speed * speed * deltaTime * 30
      col.charIndex++

      if (col.y > this.canvas.height + this.fontSize * 5) {
        col.y = -this.fontSize * 3
        col.x = Math.random() * this.canvas.width
        col.speed = 2 + Math.random() * 4
        col.chars = this.randomChars(this.densityCount)
      }
    }
  }

  resize(width: number, height: number): void {
    this.resetColumns()
  }

  destroy(): void {
    this.columns = []
    this.ctx = null
    this.canvas = null
  }
}
