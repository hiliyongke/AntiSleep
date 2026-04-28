import type { ThemeCategory, ThemeId, ThemeConfig } from '../types'

/**
 * ThemeRenderer interface — every theme must implement this
 */
export interface ThemeRenderer {
  readonly id: ThemeId
  readonly name: string
  readonly category: ThemeCategory
  readonly thumbnail: string
  readonly defaultColor: string

  init(canvas: HTMLCanvasElement, config: ThemeConfig): void
  render(deltaTime: number): void
  resize(width: number, height: number): void
  destroy(): void
}
