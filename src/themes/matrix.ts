import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Column {
  x: number
  y: number
  speed: number
  chars: string[]
  charIndex: number
  length: number
  brightness: number
  glitchOffset: number
  glitchTimer: number
}

interface GlitchBlock {
  x: number
  y: number
  width: number
  height: number
  offsetX: number
  timer: number
}

const CHAR_SETS = {
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  symbols: '∀∂∃∅∇∈∉∋∏∑−∕∗∙√∝∞∟∠∣∥∧∨∩∪∫∴∼≅≈≡≤≥⊂⊃⊄⊅⊆⊇⊕⊗⊥⋅',
  binary: '01',
  hex: '0123456789ABCDEF',
  brackets: '[]{}()<>',
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
  private glitchBlocks: GlitchBlock[] = []
  private fontSize = 14
  private config: ThemeConfig | null = null
  private densityCount = 40
  private colCount = 0
  private time = 0
  private charPool = ''
  private scanlineOffset = 0

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.fontSize = config.density === 'low' ? 18 : config.density === 'high' ? 11 : 14
    this.densityCount = config.density === 'low' ? 25 : config.density === 'high' ? 60 : 40
    this.charPool = CHAR_SETS.latin + CHAR_SETS.katakana + CHAR_SETS.symbols + CHAR_SETS.brackets
    this.resetColumns()
  }

  private resetColumns(): void {
    if (!this.canvas) return
    this.colCount = Math.ceil(this.canvas.width / this.fontSize) + 1
    this.columns = Array.from({ length: this.colCount }, () => this.createColumn())
  }

  private createColumn(): Column {
    return {
      x: Math.random() * (this.canvas?.width ?? 0),
      y: -Math.random() * (this.canvas?.height ?? 0) * 2,
      speed: 1.5 + Math.random() * 4,
      chars: this.randomChars(this.densityCount),
      charIndex: Math.floor(Math.random() * this.densityCount),
      length: 6 + Math.floor(Math.random() * 20),
      brightness: 0.5 + Math.random() * 0.5,
      glitchOffset: 0,
      glitchTimer: 0,
    }
  }

  private randomChars(count: number): string[] {
    return Array.from({ length: count }, () => this.charPool[Math.floor(Math.random() * this.charPool.length)])
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const speed = this.config.speed
    this.time += deltaTime * speed
    this.scanlineOffset = (this.scanlineOffset + deltaTime * 30 * speed) % 4

    const color = this.config.customColor || this.defaultColor
    const rgb = this.hexToRgb(color)

    // Deep fade trail
    ctx.fillStyle = `rgba(0, 3, 0, ${0.04 + speed * 0.02})`
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.font = `${this.fontSize}px "SF Mono", "Fira Code", "Cascadia Code", monospace`
    ctx.textBaseline = 'top'

    for (let c = 0; c < this.columns.length; c++) {
      const col = this.columns[c]

      // Random glitch on column
      if (Math.random() < 0.002 * speed) {
        col.glitchOffset = (Math.random() - 0.5) * 20
        col.glitchTimer = 0.1 + Math.random() * 0.2
      }
      if (col.glitchTimer > 0) {
        col.glitchTimer -= deltaTime
        if (col.glitchTimer <= 0) col.glitchOffset = 0
      }

      // Draw the trail
      for (let i = 0; i < col.length; i++) {
        const charY = col.y - i * this.fontSize
        if (charY < -this.fontSize || charY > this.canvas.height + this.fontSize) continue

        const charIndex = (col.charIndex - i + col.chars.length) % col.chars.length
        const char = col.chars[charIndex]
        const drawX = col.x + col.glitchOffset

        if (i === 0) {
          // Leading char: bright white with glow
          ctx.shadowColor = color
          ctx.shadowBlur = 12
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(char, drawX, charY)
          ctx.shadowBlur = 0

          // Extra bright core
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(char, drawX, charY)
        } else if (i === 1) {
          ctx.fillStyle = color
          ctx.fillText(char, drawX, charY)
        } else if (i === 2) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
          ctx.fillText(char, drawX, charY)
        } else {
          const trailAlpha = Math.max(0, 1 - i / col.length) * col.brightness * 0.5
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${trailAlpha})`
          ctx.fillText(char, drawX, charY)
        }
      }

      // Random character mutation
      if (Math.random() < 0.1) {
        const changeIdx = Math.floor(Math.random() * col.length)
        col.chars[(col.charIndex - changeIdx + col.chars.length) % col.chars.length] =
          this.charPool[Math.floor(Math.random() * this.charPool.length)]
      }

      col.y += col.speed * speed * deltaTime * 40
      col.charIndex++

      if (col.y > this.canvas.height + col.length * this.fontSize) {
        this.columns[c] = this.createColumn()
      }
    }

    // Screen-wide glitch blocks
    if (Math.random() < 0.005 * speed) {
      this.glitchBlocks.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        width: 20 + Math.random() * 100,
        height: this.fontSize * (1 + Math.floor(Math.random() * 3)),
        offsetX: (Math.random() - 0.5) * 40,
        timer: 0.05 + Math.random() * 0.15,
      })
    }

    for (let i = this.glitchBlocks.length - 1; i >= 0; i--) {
      const gb = this.glitchBlocks[i]
      gb.timer -= deltaTime
      if (gb.timer <= 0) {
        this.glitchBlocks.splice(i, 1)
        continue
      }

      try {
        const imageData = ctx.getImageData(gb.x, gb.y, gb.width, gb.height)
        ctx.putImageData(imageData, gb.x + gb.offsetX, gb.y)

        // Chromatic aberration
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
        ctx.fillRect(gb.x + gb.offsetX, gb.y, gb.width, gb.height)
        ctx.globalCompositeOperation = 'source-over'
      } catch {
        // Ignore out of bounds
      }
    }

    // Scanline overlay
    ctx.fillStyle = `rgba(0, 0, 0, 0.03)`
    for (let y = this.scanlineOffset; y < this.canvas.height; y += 4) {
      ctx.fillRect(0, y, this.canvas.width, 1)
    }

    // Occasional horizontal scan glitch
    if (Math.random() < 0.003 * speed) {
      const scanY = Math.random() * this.canvas.height
      const scanH = 1 + Math.random() * 3
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
      ctx.fillRect(0, scanY, this.canvas.width, scanH)
    }
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

  resize(width: number, height: number): void {
    this.resetColumns()
  }

  destroy(): void {
    this.columns = []
    this.glitchBlocks = []
    this.ctx = null
    this.canvas = null
  }
}
