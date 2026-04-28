import type { ThemeRenderer } from './types'
import type { ThemeConfig } from '../types'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
}

interface Link {
  a: number
  b: number
}

export class ParticleNetworkRenderer implements ThemeRenderer {
  readonly id = 'particle-network' as const
  readonly name = '粒子网络'
  readonly category = 'tech' as const
  readonly thumbnail = ''
  readonly defaultColor = '#0078D4'

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private config: ThemeConfig | null = null
  private time = 0
  private nodes: Node[] = []
  private links: Link[] = []
  private mouseX = -1000
  private mouseY = -1000

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config
    this.resetNodes()
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
    const count = this.config?.density === 'low' ? 30 : this.config?.density === 'high' ? 70 : 48

    this.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * this.canvas!.width,
      y: Math.random() * this.canvas!.height,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 18,
      size: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
    }))

    // Build sparse, elegant links: each node connects to 1-3 nearest neighbors
    this.links = []
    for (let i = 0; i < this.nodes.length; i++) {
      const dists = []
      for (let j = 0; j < this.nodes.length; j++) {
        if (i === j) continue
        const dx = this.nodes[i].x - this.nodes[j].x
        const dy = this.nodes[i].y - this.nodes[j].y
        dists.push({ j, d: dx * dx + dy * dy })
      }
      dists.sort((a, b) => a.d - b.d)
      const nLinks = 1 + Math.floor(Math.random() * 2)
      for (let k = 0; k < nLinks && k < dists.length; k++) {
        const j = dists[k].j
        const exists = this.links.some(l => (l.a === i && l.b === j) || (l.a === j && l.b === i))
        if (!exists) this.links.push({ a: i, b: j })
      }
    }
  }

  render(deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.config) return
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height
    const color = this.config.customColor || this.defaultColor
    const speed = 0.5 + this.config.speed * 0.8
    this.time += deltaTime * speed

    // Soft trail fade
    ctx.fillStyle = 'rgba(4, 6, 12, 0.22)'
    ctx.fillRect(0, 0, w, h)

    // Update nodes
    for (const n of this.nodes) {
      // Mouse repulsion
      const mdx = n.x - this.mouseX
      const mdy = n.y - this.mouseY
      const md = Math.sqrt(mdx * mdx + mdy * mdy)
      if (md < 160 && md > 0) {
        const f = ((160 - md) / 160) * 60
        n.vx += (mdx / md) * f * deltaTime
        n.vy += (mdy / md) * f * deltaTime
      }

      n.vx *= 0.99
      n.vy *= 0.99
      n.x += n.vx * deltaTime * speed
      n.y += n.vy * deltaTime * speed

      // Wrap
      if (n.x < -20) n.x = w + 20
      if (n.x > w + 20) n.x = -20
      if (n.y < -20) n.y = h + 20
      if (n.y > h + 20) n.y = -20
    }

    // Draw links
    const maxLinkDist = 260
    for (const link of this.links) {
      const a = this.nodes[link.a]
      const b = this.nodes[link.b]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxLinkDist) continue

      const fade = 1 - dist / maxLinkDist
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 1.8 + link.a * 0.4)
      const alpha = fade * pulse * 0.5

      // Outer soft glow line
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = color + this.alphaHex(alpha * 0.2)
      ctx.lineWidth = 3
      ctx.stroke()

      // Inner bright line
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = color + this.alphaHex(alpha * 0.55)
      ctx.lineWidth = 1
      ctx.stroke()

      // Traveling energy dot
      const t = (this.time * 0.25 + link.a * 0.17) % 1
      const ex = a.x + (b.x - a.x) * t
      const ey = a.y + (b.y - a.y) * t
      const eSize = 1.5 + fade * 2

      // Dot glow
      ctx.beginPath()
      ctx.arc(ex, ey, eSize * 3, 0, Math.PI * 2)
      ctx.fillStyle = color + this.alphaHex(alpha * 0.25)
      ctx.fill()

      // Dot core
      ctx.beginPath()
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF' + this.alphaHex(alpha * 0.9)
      ctx.fill()
    }

    // Draw nodes
    for (const n of this.nodes) {
      const breathe = 1 + 0.2 * Math.sin(this.time * 2 + n.phase)
      const r = n.size * breathe

      // Large soft halo
      ctx.beginPath()
      ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2)
      const halo = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 6)
      halo.addColorStop(0, color + '20')
      halo.addColorStop(1, color + '00')
      ctx.fillStyle = halo
      ctx.fill()

      // Medium glow
      ctx.beginPath()
      ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2)
      const glow = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, r * 2.5)
      glow.addColorStop(0, color + '70')
      glow.addColorStop(1, color + '00')
      ctx.fillStyle = glow
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = color + 'DD'
      ctx.fill()

      // Bright center
      ctx.beginPath()
      ctx.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF' + '90'
      ctx.fill()
    }

    // Mouse glow
    if (this.mouseX > 0) {
      ctx.beginPath()
      ctx.arc(this.mouseX, this.mouseY, 35, 0, Math.PI * 2)
      const mg = ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, 35)
      mg.addColorStop(0, color + '18')
      mg.addColorStop(1, 'transparent')
      ctx.fillStyle = mg
      ctx.fill()
    }
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
    this.ctx = null
    this.canvas = null
  }
}
