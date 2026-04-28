import { useAppStore } from '../../stores/appStore'
import type { DurationOption } from '../../types'

const DURATIONS: { value: DurationOption; label: string }[] = [
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
  { value: null, label: '∞' },
]

export function DurationSelector() {
  const duration = useAppStore((s) => s.prevention.duration)
  const setDuration = useAppStore((s) => s.setDuration)

  return (
    <div className="flex gap-2">
      {DURATIONS.map((d) => (
        <button
          key={d.label}
          onClick={() => setDuration(d.value)}
          className={`capsule flex-1 text-center ${
            duration === d.value ? 'capsule-active' : 'capsule-inactive'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
