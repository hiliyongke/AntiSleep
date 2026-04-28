import type { MarqueeMode, MarqueeSpeed, MarqueePosition, MarqueeItem } from '../types'

export type { MarqueeMode, MarqueeSpeed, MarqueePosition, MarqueeItem }

/** Speed to duration mapping (seconds) */
export const SPEED_DURATIONS: Record<MarqueeSpeed, number> = {
  slow: 15,
  medium: 8,
  fast: 4,
}

/** Get CSS animation duration from speed setting */
export function getMarqueeDuration(speed: MarqueeSpeed, customSpeed?: number): string {
  const seconds = customSpeed ?? SPEED_DURATIONS[speed]
  return `${seconds}s`
}

/** Get position CSS classes */
export function getMarqueePositionClasses(position: MarqueePosition): string {
  switch (position) {
    case 'top':
      return 'top-[10%]'
    case 'center':
      return 'top-1/2 -translate-y-1/2'
    case 'center-bottom':
      return 'top-[65%]'
    case 'bottom':
      return 'bottom-[10%]'
    case 'top-left':
      return 'top-[10%] left-[5%]'
    case 'top-right':
      return 'top-[10%] right-[5%]'
    case 'bottom-left':
      return 'bottom-[10%] left-[5%]'
    case 'bottom-right':
      return 'bottom-[10%] right-[5%]'
  }
}
