import type { ThemeId, ThemeCategory, ThemeConfig } from '../types'
import type { ThemeRenderer } from './types'
import { MatrixRenderer } from './matrix'
import { ParticleNetworkRenderer } from './particle-network'
import { StarfieldRenderer } from './starfield'
import { AuroraRenderer } from './aurora'
import { BreathingLightRenderer } from './breathing-light'
import { ClockRenderer } from './clock'

// Theme metadata
interface ThemeMeta {
  id: ThemeId
  name: string
  category: ThemeCategory
  thumbnail: string
  defaultColor: string
}

const themeMetaList: ThemeMeta[] = [
  { id: 'matrix', name: '矩阵代码雨', category: 'tech', thumbnail: '', defaultColor: '#16C60C' },
  { id: 'particle-network', name: '粒子网络', category: 'tech', thumbnail: '', defaultColor: '#0078D4' },
  { id: 'starfield', name: '星空', category: 'nature', thumbnail: '', defaultColor: '#FFFFFF' },
  { id: 'aurora', name: '极光', category: 'nature', thumbnail: '', defaultColor: '#16C60C' },
  { id: 'breathing-light', name: '呼吸灯', category: 'minimal', thumbnail: '', defaultColor: '#D83B01' },
  { id: 'clock', name: '时钟', category: 'minimal', thumbnail: '', defaultColor: '#FFFFFF' },
]

// Singleton instances
const themeInstances: Map<ThemeId, ThemeRenderer> = new Map()

function getOrCreateRenderer(id: ThemeId): ThemeRenderer | null {
  if (themeInstances.has(id)) return themeInstances.get(id)!

  let renderer: ThemeRenderer | null = null
  switch (id) {
    case 'matrix': renderer = new MatrixRenderer(); break
    case 'particle-network': renderer = new ParticleNetworkRenderer(); break
    case 'starfield': renderer = new StarfieldRenderer(); break
    case 'aurora': renderer = new AuroraRenderer(); break
    case 'breathing-light': renderer = new BreathingLightRenderer(); break
    case 'clock': renderer = new ClockRenderer(); break
  }

  if (renderer) themeInstances.set(id, renderer)
  return renderer
}

export function getThemeRenderer(id: ThemeId): ThemeRenderer | null {
  return getOrCreateRenderer(id)
}

export function getThemeMetaList(): ThemeMeta[] {
  return themeMetaList
}

export function getThemeMeta(id: ThemeId): ThemeMeta | undefined {
  return themeMetaList.find((t) => t.id === id)
}
