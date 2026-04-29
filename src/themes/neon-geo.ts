import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  sides: number // 3=triangle, 4=diamond, 6=hexagon
  rotation: number
  rotSpeed: number
  color: string
  phase: number
}

interface Link {
  a: number
  b: number
  strength: number
}

interface ScanBeam {
  offset: number
  speed: number
  alpha: number
}

export class NeonGeoRenderer implements ThemeRenderer {
  readonly id = 'neon-geo' as const
  readonly name = '霓虹几何'
  readonly category = 'tech' as const
  readonly thumbnail = ''
  readonly defaultColor = '#FF006E'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private time = 0
  private nodes: Node[] = []
  private links: Link[] = []
  private beams: ScanBeam[] = []
  private mouseX = -1000
  private mouseY = -1000

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetNodes()
    this.beams = Array.from({ length: 3 }, (_, i) => ({
      offset: i * 0.33,
      speed: 0.08 + i * 0.03,
      alpha: 0.05 + i * 0.02,
    }))
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

  private resetNodes(): void {
    if (!this.canvas) return
    const density = this.config?.density === 'low' ? 10 : this.config?.density === 'high' ? 28 : 18
    const baseColor = this.config?.customColor || this.defaultColor
    const palette = this.getPalette(baseColor)

    this.nodes = Array.from({ length: density }, (_, i) => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      size: 14 + Math.random() * 22,
      sides: [3, 4, 6][Math.floor(Math.random() * 3)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      color: palette[i % palette.length],
      phase: Math.random() * Math.PI * 2,
    }))

    // Build Delaunay-like links: each node connects to 2-4 nearest neighbors
    this.links = []
    for (let i = 0; i < this.nodes.length; i++) {
      const distances = []
      for (let j = 0; j < this.nodes.length; j++) {
        if (i === j) continue
        const dx = this.nodes[i].x - this.nodes[j].x
        const dy = this.nodes[i].y - this.nodes[j].y
        distances.push({ j, dist: dx * dx + dy * dy })
      }
      distances.sort((a, b) => a.dist - b.dist)
      const connectCount = 2 + Math.floor(Math.random() * 2)
      for (let k = 0; k < connectCount && k < distances.length; k++) {
        const j = distances[k].j
        // Avoid duplicates
        const exists = this.links.some(l => (l.a === i && l.b === j) || (l.a === j && l.b === i))
        if (!exists) {
          this.links.push({ a: i, b: j, strength: 1 })
        }
      }
    }
  }

  private getPalette(base: string): string[] {
    if (base !== this.defaultColor) {
      // Generate analogous colors from base
      const hsl = this.hexToHsl(base)
      return [
        base,
        this.hslToHex((hsl.h + 0.08) % 1, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 0.92) % 1, hsl.s, hsl.l),
        this.hslToHex(hsl.h, Math.min(1, hsl.s * 0.7), Math.min(1, hsl.l * 1.3)),
      ]
    }
    return ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5']
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
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

  private hslToHex(h: number, s: number, l: number): string {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    let r: number, g: number, b: number
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    const speed = 0.5 + this.config.speed * 0.8
    this.time += deltaTime * speed

    // Clear with very slight fade for motion blur feel
    ctx.fillStyle = 'rgba(6, 6, 14, 0.35)'
    ctx.fillRect(0, 0, w, h)

    for (const beam of this.beams) {
      const x = ((this.time * beam.speed + beam.offset) % 1.2) * w - w * 0.1
      const grad = ctx.createLinearGradient(x - 40, 0, x + 40, 0)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(0.5, (this.config.customColor || this.defaultColor) + this.alphaHex(beam.alpha))
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(x - 40, 0, 80, h)
    }

    // Update node positions
    for (const n of this.nodes) {
      // Mouse repulsion
      const mdx = n.x - this.mouseX
      const mdy = n.y - this.mouseY
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
      if (mDist < 180 && mDist > 0) {
        const force = ((180 - mDist) / 180) * 80
        n.vx += (mdx / mDist) * force * deltaTime
        n.vy += (mdy / mDist) * force * deltaTime
      }

      // Gentle drift
      n.vx += Math.sin(this.time * 0.4 + n.phase) * 2 * deltaTime
      n.vy += Math.cos(this.time * 0.3 + n.phase) * 2 * deltaTime

      // Damping
      n.vx *= 0.985
      n.vy *= 0.985

      n.x += n.vx * deltaTime * speed
      n.y += n.vy * deltaTime * speed
      n.rotation += n.rotSpeed * deltaTime * speed

      // Bounce off edges
      if (n.x < n.size) { n.x = n.size; n.vx *= -0.7 }
      if (n.x > w - n.size) { n.x = w - n.size; n.vx *= -0.7 }
      if (n.y < n.size) { n.y = n.size; n.vy *= -0.7 }
      if (n.y > h - n.size) { n.y = h - n.size; n.vy *= -0.7 }
    }

    // Draw links with neon glow
    for (const link of this.links) {
      const a = this.nodes[link.a]
      const b = this.nodes[link.b]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 280
      if (dist > maxDist) continue

      const fade = 1 - dist / maxDist
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 2 + link.a * 0.7 + link.b * 0.3)
      const alpha = fade * pulse * 0.7

      // Outer glow
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = a.color + this.alphaHex(alpha * 0.25)
      ctx.lineWidth = 4
      ctx.stroke()

      // Inner bright line
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = a.color + this.alphaHex(alpha * 0.6)
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Traveling light dot
      const t = (this.time * 0.35 + link.a * 0.13) % 1
      const lx = a.x + (b.x - a.x) * t
      const ly = a.y + (b.y - a.y) * t
      const dotSize = 2 + fade * 2.5

      ctx.beginPath()
      ctx.arc(lx, ly, dotSize * 2, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF' + this.alphaHex(alpha * 0.3)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(lx, ly, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF' + this.alphaHex(alpha * 0.9)
      ctx.fill()
    }

    // Draw nodes
    for (const n of this.nodes) {
      const breathe = 1 + 0.12 * Math.sin(this.time * 1.5 + n.phase)
      const size = n.size * breathe

      // Multi-layer neon glow
      for (let glow = 3; glow >= 1; glow--) {
        ctx.save()
        ctx.shadowColor = n.color
        ctx.shadowBlur = size * glow * 1.2
        ctx.translate(n.x, n.y)
        ctx.rotate(n.rotation)
        this.drawPolygon(ctx, n.sides, size)
        ctx.strokeStyle = n.color + this.alphaHex(0.15 * glow)
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      }

      // Main shape outline
      ctx.save()
      ctx.shadowColor = n.color
      ctx.shadowBlur = size * 0.8
      ctx.translate(n.x, n.y)
      ctx.rotate(n.rotation)
      this.drawPolygon(ctx, n.sides, size)
      ctx.strokeStyle = n.color + 'DD'
      ctx.lineWidth = 1.8
      ctx.stroke()

      // Very subtle fill
      ctx.fillStyle = n.color + '18'
      ctx.fill()
      ctx.restore()

      // Inner bright dot
      ctx.beginPath()
      ctx.arc(n.x, n.y, size * 0.1, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF' + 'A0'
      ctx.fill()
    }

    // Mouse cursor glow
    if (this.mouseX > 0) {
      ctx.beginPath()
      ctx.arc(this.mouseX, this.mouseY, 40, 0, Math.PI * 2)
      const mg = ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, 40)
      mg.addColorStop(0, (this.config.customColor || this.defaultColor) + '20')
      mg.addColorStop(1, 'transparent')
      ctx.fillStyle = mg
      ctx.fill()
    }
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, sides: number, radius: number): void {
    ctx.beginPath()
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides - Math.PI / 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
  }

  private alphaHex(a: number): string {
    return Math.round(Math.max(0, Math.min(1, a)) * 255)
      .toString(16)
      .padStart(2, '0')
  }

  resize(): void {
    this.resetNodes()
  }

  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove)
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
    }
    this.nodes = []
    this.links = []
    this.beams = []
    this.ctx = null
    this.canvas = null
  }
}
