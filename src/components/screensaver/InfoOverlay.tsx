import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useSleepPrevention } from '../../hooks/useSleepPrevention'

export function InfoOverlay() {
  const prevention = useAppStore((s) => s.prevention)
  const { getRemainingTimeText, getStatusColor } = useSleepPrevention()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="absolute top-6 left-6 z-30 pointer-events-none">
      <div className="acrylic-subtle rounded-md px-4 py-2.5 flex items-center gap-3">
        <span className="text-lg font-light tabular-nums" style={{ color: 'var(--text-primary)' }}>{timeStr}</span>
        {prevention.active && (
          <>
            <div className="w-px h-4" style={{ backgroundColor: 'var(--border-fluent)' }} />
            <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {getRemainingTimeText()}
            </span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
          </>
        )}
      </div>
    </div>
  )
}
