import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface DigitState {
  current: string
  previous: string
  flipProgress: number
  isFlipping: boolean
}

export class ClockRenderer implements ThemeRenderer {
  readonly id = 'clock' as const
  readonly name = '时钟'
  readonly category = 'minimal' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FFFFFF'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private clockStyle: 'analog' | 'digital' = 'analog'
  private clockSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
  private clockPosition: 'top' | 'center' | 'bottom' = 'center'
  // 自定义坐标（屏幕百分比 0-100）
  private clockPositionX?: number
  private clockPositionY?: number
  private digits: DigitState[] = []
  private lastTimeStr = ''
  private orbitDots: { angle: number; radius: number; speed: number; size: number }[] = []

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    // Save clock size and position from config
    this.clockSize = config.clockSize || 'medium'
    this.clockPosition = config.clockPosition || 'center'
    this.clockPositionX = config.clockPositionX
    this.clockPositionY = config.clockPositionY
    // Init 6 digit slots: H H M M S S
    this.digits = Array.from({ length: 6 }, () => ({
      current: '0',
      previous: '0',
      flipProgress: 1,
      isFlipping: false,
    }))
    this.lastTimeStr = '000000'
    this.orbitDots = Array.from({ length: 10 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.22 + Math.random() * 0.12,
      speed: 0.08 + Math.random() * 0.15,
      size: 1 + Math.random() * 2,
    }))
  }

  setClockStyle(style: 'analog' | 'digital'): void {
    this.clockStyle = style
  }

  setClockSize(size: 'small' | 'medium' | 'large' | 'xlarge'): void {
    this.clockSize = size
  }

  setClockPosition(position: 'top' | 'center' | 'bottom'): void {
    this.clockPosition = position
  }

  setClockPositionX(x?: number): void {
    this.clockPositionX = x
  }

  setClockPositionY(y?: number): void {
    this.clockPositionY = y
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const color = this.config.customColor || this.defaultColor

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.clockStyle === 'digital') {
      this.renderFlipClock(ctx, color, deltaTime)
    } else {
      this.renderAnalog(ctx, color)
    }
  }

  /**
   * Digital clock — single line text with blinking colon
   */
  private renderFlipClock(ctx: CanvasRenderingContext2D, color: string, _deltaTime: number): void {
    const w = this.canvas!.width
    const h = this.canvas!.height

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const blink = Math.sin(Date.now() / 500) > 0
    const colon = blink ? ':' : ' '
    const timeStr = `${hours}${colon}${minutes}${colon}${seconds}`

    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    const accentColor = this.config?.customColor || '#0078D4'
    const baseSize = Math.min(w, h)

    // 根据时钟大小调整缩放
    const scale = this.getSizeScale()

    // 字体大小必须在 centerY 计算之前定义
    const fontSize = Math.max(24, baseSize * 0.18 * scale)
    const dateFontSize = Math.max(12, baseSize * 0.032 * scale)

    // 根据位置动态调整 centerY，确保时间+日期两行完全在画布内
    // bottomPad：为底部 FloatingControls 预留空间（与 getPositionY 一致）
    const bottomPad = Math.min(80, h * 0.07)
    // 整块内容底部相对于 centerY 的偏移量
    const blockBottomOffset = fontSize * 0.45 + dateFontSize

    const centerYMap: Record<string, number> = {
      // 顶部：时间顶部不贴边
      'top':    fontSize * 0.8,
      // 居中：整块（时间+日期）在 (h - bottomPad) 内居中
      'center':  (h - bottomPad) / 2 - blockBottomOffset / 2,
      // 底部：日期底部不超出 FloatingControls 顶部
      'bottom':  h - bottomPad - blockBottomOffset,
    }
    // 自定义坐标优先（百分比 → 像素）
    const centerY = this.clockPositionY !== undefined
      ? h * this.clockPositionY / 100
      : centerYMap[this.clockPosition] || (h - bottomPad) / 2
    const centerX = this.clockPositionX !== undefined
      ? w * this.clockPositionX / 100
      : w / 2

    // Time text — single line
    ctx.font = `200 ${fontSize}px "SF Mono", "SF Pro Display", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Subtle text shadow for glow
    ctx.save()
    ctx.shadowColor = accentColor + '40'
    ctx.shadowBlur = 20 * scale
    ctx.fillStyle = color + 'F0'
    ctx.fillText(timeStr, centerX, centerY - baseSize * 0.02 * scale)
    ctx.restore()

    // Date below
    ctx.font = `400 ${dateFontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = color + '50'
    ctx.fillText(dateStr, centerX, centerY + fontSize * 0.45)

    // Subtle glow behind
    const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, baseSize * 0.5)
    glowGrad.addColorStop(0, accentColor + '08')
    glowGrad.addColorStop(1, accentColor + '00')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, w, h)

    for (const dot of this.orbitDots) {
      dot.angle += _deltaTime * dot.speed
      const dx = Math.cos(dot.angle) * baseSize * dot.radius
      const dy = Math.sin(dot.angle) * baseSize * dot.radius * 0.55
      ctx.beginPath()
      ctx.arc(w / 2 + dx, h / 2 + dy, dot.size, 0, Math.PI * 2)
      ctx.fillStyle = accentColor + '55'
      ctx.fill()
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
    ctx.lineTo(x + w, y + h - r)
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
    ctx.lineTo(x + r, y + h)
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
    ctx.lineTo(x, y + r)
    ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2)
    ctx.closePath()
  }

  private getSizeScale(): number {
    const sizeMap: Record<string, number> = {
      'small': 0.45,
      'medium': 0.65,
      'large': 0.85,
      'xlarge': 1.1,
    }
    return sizeMap[this.clockSize] || 0.65
  }

  /**
   * 根据位置和已缩放的半径计算 cy
   * 确保表盘 + 下方日期文字完全在画布内
   * 日期区域实际占高 ≈ s(25) + digitalFontSize + s(10) + dateFontSize2 ≈ radius * 0.5
   */
  private getPositionY(h: number, radius: number): number {
    // 日期区域高度（含余量）
    const dateArea = radius * 0.58
    // 表盘顶部预留（刻度/数字不贴边）
    const topGap = radius * 0.12
    // 底部工具栏预留（与 renderFlipClock 一致）
    const bottomPad = Math.min(80, h * 0.07)

    const positionMap: Record<string, number> = {
      // 顶部：表盘顶部不贴边，日期不超出底部
      'top': radius + topGap,
      // 居中：整体（表盘 + 日期）居中，预留底部工具栏
      'center': (h - dateArea - bottomPad) / 2,
      // 底部：表盘底部 + 日期不超出工具栏顶部
      'bottom': h - radius - dateArea - bottomPad,
    }
    return positionMap[this.clockPosition] || (h - dateArea - bottomPad) / 2
  }

  private renderAnalog(ctx: CanvasRenderingContext2D, color: string): void {
    const w = this.canvas!.width
    const h = this.canvas!.height
    // 根据时钟大小调整表盘尺寸（baseRadius 系数从 0.4 降到 0.28）
    const baseRadius = Math.min(w, h) * 0.28
    const scale = this.getSizeScale()
    const radius = baseRadius * scale

    // 自定义坐标（百分比）→ 画布像素坐标
    const cx = this.clockPositionX !== undefined ? w * this.clockPositionX / 100 : w / 2
    const cy = this.clockPositionY !== undefined ? h * this.clockPositionY / 100 : this.getPositionY(h, radius)

    const now = new Date()
    const hours = now.getHours() % 12
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const ms = now.getMilliseconds()
    const smoothSeconds = seconds + ms / 1000

    const accentColor = this.config?.customColor || '#0078D4'
    const s = (v: number) => v * (radius / 180)

    // ── Outer shadow (拟物化立体阴影) ──
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = radius * 0.08
    ctx.shadowOffsetY = radius * 0.04
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2)
    ctx.fillStyle = 'transparent'
    ctx.fill()
    ctx.restore()

    // ── 外圈金属质感 ──
    const outerBezel = radius * 1.08
    const bezelGrad = ctx.createRadialGradient(cx - radius * 0.15, cy - radius * 0.15, radius * 0.8, cx, cy, outerBezel)
    bezelGrad.addColorStop(0, color + '30')
    bezelGrad.addColorStop(0.5, color + '18')
    bezelGrad.addColorStop(1, color + '08')
    ctx.beginPath()
    ctx.arc(cx, cy, outerBezel, 0, Math.PI * 2)
    ctx.fillStyle = bezelGrad
    ctx.fill()
    ctx.strokeStyle = color + '55'
    ctx.lineWidth = s(3)
    ctx.stroke()

    // ── 内圈金属质感 ──
    const innerBezel = radius * 1.02
    const innerBezelGrad = ctx.createRadialGradient(cx, cy - radius * 0.2, 0, cx, cy, innerBezel)
    innerBezelGrad.addColorStop(0, color + '15')
    innerBezelGrad.addColorStop(0.8, color + '08')
    innerBezelGrad.addColorStop(1, color + '20')
    ctx.beginPath()
    ctx.arc(cx, cy, innerBezel, 0, Math.PI * 2)
    ctx.fillStyle = innerBezelGrad
    ctx.fill()
    ctx.strokeStyle = color + '40'
    ctx.lineWidth = s(1.5)
    ctx.stroke()

    // ── 表盘底色（拟物化磨砂质感）──
    const faceGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.25, 0, cx, cy, radius)
    faceGrad.addColorStop(0, color + '12')
    faceGrad.addColorStop(0.6, color + '06')
    faceGrad.addColorStop(1, color + '15')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = faceGrad
    ctx.fill()
    ctx.strokeStyle = color + '30'
    ctx.lineWidth = s(1)
    ctx.stroke()

    // ── 装饰螺丝（12、3、6、9点位置）──
    const screwPositions = [0, 3, 6, 9]
    for (const hour of screwPositions) {
      const angle = (hour * Math.PI * 2) / 12 - Math.PI / 2
      const screwR = radius * 1.05
      const sx = cx + Math.cos(angle) * screwR
      const sy = cy + Math.sin(angle) * screwR
      // 螺丝底色
      ctx.beginPath()
      ctx.arc(sx, sy, s(5), 0, Math.PI * 2)
      ctx.fillStyle = color + '25'
      ctx.fill()
      ctx.strokeStyle = color + '50'
      ctx.lineWidth = s(0.8)
      ctx.stroke()
      // 螺丝十字纹
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(Math.PI / 4)
      ctx.beginPath()
      ctx.moveTo(-s(2), 0)
      ctx.lineTo(s(2), 0)
      ctx.moveTo(0, -s(2))
      ctx.lineTo(0, s(2))
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = s(0.6)
      ctx.stroke()
      ctx.restore()
    }

    // ── Hour tick marks — 12 prominent lines ──
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2
      const innerR = radius - s(14)
      const outerR = radius - s(4)
      const x1 = cx + Math.cos(angle) * innerR
      const y1 = cy + Math.sin(angle) * innerR
      const x2 = cx + Math.cos(angle) * outerR
      const y2 = cy + Math.sin(angle) * outerR
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = color + 'DD'
      ctx.lineWidth = s(3)
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // ── Minute tick marks — 60 subtle lines ──
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue
      const angle = (i * Math.PI * 2) / 60 - Math.PI / 2
      const innerR = radius - s(8)
      const outerR = radius - s(4)
      const x1 = cx + Math.cos(angle) * innerR
      const y1 = cy + Math.sin(angle) * innerR
      const x2 = cx + Math.cos(angle) * outerR
      const y2 = cy + Math.sin(angle) * outerR
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = color + '66'
      ctx.lineWidth = s(1)
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // ── Hour numbers — all 12 numbers ──
    const numRadius = radius - s(34)
    const numSize = Math.max(14, radius * 0.17)
    ctx.font = `500 ${numSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 1; i <= 12; i++) {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2
      const nx = cx + Math.cos(angle) * numRadius
      const ny = cy + Math.sin(angle) * numRadius
      ctx.fillStyle = color + 'EE'
      ctx.fillText(String(i), nx, ny + s(1))
    }

    // ── Date window at 3 o'clock position ──
    const dateX = cx + radius * 0.38
    const dateY = cy + radius * 0.02
    const dateStr = String(now.getDate())
    const dateFontSize = Math.max(10, radius * 0.09)
    const dateBoxW = s(28)
    const dateBoxH = s(22)
    // Date box background (拟物化凸起效果)
    ctx.fillStyle = color + '15'
    this.roundRect(ctx, dateX - dateBoxW / 2, dateY - dateBoxH / 2, dateBoxW, dateBoxH, s(5))
    ctx.fill()
    ctx.strokeStyle = color + '40'
    ctx.lineWidth = s(1.2)
    this.roundRect(ctx, dateX - dateBoxW / 2, dateY - dateBoxH / 2, dateBoxW, dateBoxH, s(5))
    ctx.stroke()
    // Date text
    ctx.font = `600 ${dateFontSize}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = accentColor + 'EE'
    ctx.fillText(dateStr, dateX, dateY + s(0.5))

    // ── Hour hand ──
    const hourAngle = ((hours + minutes / 60) * Math.PI * 2) / 12 - Math.PI / 2
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = s(6)
    ctx.shadowOffsetY = s(2)
    this.drawTaperedHand(ctx, cx, cy, hourAngle, radius * 0.48, s(8), s(2.5), color + 'FF')
    ctx.restore()

    // ── Minute hand ──
    const minuteAngle = ((minutes + smoothSeconds / 60) * Math.PI * 2) / 60 - Math.PI / 2
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = s(4)
    ctx.shadowOffsetY = s(1.5)
    this.drawTaperedHand(ctx, cx, cy, minuteAngle, radius * 0.7, s(6), s(1.5), color + 'EE')
    ctx.restore()

    // ── Second hand ──
    const secondAngle = (smoothSeconds * Math.PI * 2) / 60 - Math.PI / 2
    // Counterweight (tail)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(secondAngle + Math.PI) * radius * 0.18,
      cy + Math.sin(secondAngle + Math.PI) * radius * 0.18,
    )
    ctx.strokeStyle = accentColor + 'EE'
    ctx.lineWidth = s(2.5)
    ctx.lineCap = 'round'
    ctx.stroke()
    // Main line
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(secondAngle) * radius * 0.8,
      cy + Math.sin(secondAngle) * radius * 0.8,
    )
    ctx.strokeStyle = accentColor + 'FF'
    ctx.lineWidth = s(1.5)
    ctx.lineCap = 'round'
    ctx.stroke()
    // Tip circle
    const tipX = cx + Math.cos(secondAngle) * radius * 0.68
    const tipY = cy + Math.sin(secondAngle) * radius * 0.68
    ctx.beginPath()
    ctx.arc(tipX, tipY, s(3.5), 0, Math.PI * 2)
    ctx.fillStyle = accentColor + 'FF'
    ctx.fill()

    // ── Center dot (拟物化立体) ──
    ctx.beginPath()
    ctx.arc(cx, cy, s(6), 0, Math.PI * 2)
    ctx.fillStyle = accentColor + 'DD'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, s(4), 0, Math.PI * 2)
    ctx.fillStyle = accentColor + 'FF'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, s(2), 0, Math.PI * 2)
    ctx.fillStyle = color + 'FF'
    ctx.fill()

    // ── Digital time below the dial ──
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const fullDateStr = now.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

    const digitalFontSize = Math.max(14, radius * 0.18)
    const timeY = cy + radius + s(25)
    ctx.font = `300 ${digitalFontSize}px "SF Mono", "SF Pro Display", "Segoe UI Variable", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.save()
    ctx.shadowColor = accentColor + '80'
    ctx.shadowBlur = s(10)
    ctx.fillStyle = color + 'EE'
    ctx.fillText(timeStr, cx, timeY)
    ctx.restore()

    const dateFontSize2 = digitalFontSize * 0.6
    const fullDateY = timeY + digitalFontSize + s(10)
    ctx.font = `400 ${dateFontSize2}px "SF Pro Display", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif`
    ctx.fillStyle = color + '99'
    ctx.fillText(fullDateStr, cx, fullDateY)
  }

  private drawTaperedHand(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    angle: number,
    length: number,
    baseWidth: number,
    tipWidth: number,
    color: string,
  ): void {
    const perpAngle = angle + Math.PI / 2
    const bx1 = cx + Math.cos(perpAngle) * baseWidth / 2
    const by1 = cy + Math.sin(perpAngle) * baseWidth / 2
    const bx2 = cx - Math.cos(perpAngle) * baseWidth / 2
    const by2 = cy - Math.sin(perpAngle) * baseWidth / 2
    const tx1 = cx + Math.cos(angle) * length + Math.cos(perpAngle) * tipWidth / 2
    const ty1 = cy + Math.sin(angle) * length + Math.sin(perpAngle) * tipWidth / 2
    const tx2 = cx + Math.cos(angle) * length - Math.cos(perpAngle) * tipWidth / 2
    const ty2 = cy + Math.sin(angle) * length - Math.sin(perpAngle) * tipWidth / 2

    ctx.beginPath()
    ctx.moveTo(bx1, by1)
    ctx.lineTo(tx1, ty1)
    ctx.lineTo(tx2, ty2)
    ctx.lineTo(bx2, by2)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  private drawHand(
    cx: number,
    cy: number,
    angle: number,
    length: number,
    width: number,
    color: string,
  ): void {
    if (!this.ctx) return
    this.ctx.beginPath()
    this.ctx.moveTo(cx, cy)
    this.ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
  }

  resize(): void {}

  destroy(): void {
    this.ctx = null
    this.canvas = null
  }
}
