import { useAppStore } from '../../stores/appStore'

export function MarqueePreview() {
  const marquee = useAppStore((s) => s.marquee)
  const current = marquee.items[0]

  if (!current) return null

  return (
    <div className="acrylic-subtle rounded-md px-3 py-1.5 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>跑马灯</span>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div
            className="inline-flex items-center min-w-max"
            style={{
              animation: 'marquee-loop 8s linear infinite',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {Array.from({ length: 2 }, (_, index) => (
              <span
                key={index}
                className="text-xs shrink-0"
                style={{ color: 'var(--text-secondary)', paddingRight: '32px' }}
              >
                {current.content}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
