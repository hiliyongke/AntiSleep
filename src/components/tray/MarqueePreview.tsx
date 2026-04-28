import { useAppStore } from '../../stores/appStore'

export function MarqueePreview() {
  const marquee = useAppStore((s) => s.marquee)
  const current = marquee.items[0]

  if (!current) return null

  return (
    <div className="acrylic-subtle rounded-md px-3 py-1.5 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary text-[10px] shrink-0">跑马灯</span>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <span className="text-xs text-text-secondary inline-block animate-marquee-horizontal">
            {current.content}
          </span>
        </div>
      </div>
    </div>
  )
}
