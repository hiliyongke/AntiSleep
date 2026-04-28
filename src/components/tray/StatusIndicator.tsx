interface StatusIndicatorProps {
  active: boolean
  statusColor: string
  remainingText: string
  expiringSoon: boolean
}

export function StatusIndicator({ active, statusColor, remainingText, expiringSoon }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Breathing dot */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {active && (
          <div
            className="absolute w-10 h-10 rounded-full animate-breathe"
            style={{ backgroundColor: statusColor, opacity: 0.25 }}
          />
        )}
        <div
          className="relative w-4 h-4 rounded-full"
          style={{
            backgroundColor: statusColor,
            boxShadow: active ? `0 0 8px ${statusColor}` : 'none',
          }}
        />
      </div>

      {/* Status text */}
      <div className="flex flex-col">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {active ? '防锁屏已激活' : '防锁屏已暂停'}
        </span>
        {active && remainingText && (
          <span className="text-xs" style={{ color: expiringSoon ? '#D83B01' : 'var(--text-secondary)' }}>
            剩余 {remainingText}
          </span>
        )}
        {!active && (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>点击下方按钮开始</span>
        )}
      </div>
    </div>
  )
}
