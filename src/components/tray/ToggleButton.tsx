import { useRef } from 'react'

interface ToggleButtonProps {
  active: boolean
  onToggle: () => void
}

export function ToggleButton({ active, onToggle }: ToggleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    // Ripple effect
    if (btnRef.current) {
      const ripple = document.createElement('span')
      ripple.className = 'absolute inset-0 rounded-md animate-ripple'
      ripple.style.background = active
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 120, 212, 0.20)'
      btnRef.current.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    onToggle()
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`relative overflow-hidden w-full py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
        active
          ? 'fluent-btn-primary'
          : 'fluent-btn hover:bg-accent/20 hover:border-accent/40 hover:text-accent'
      }`}
    >
      {active ? '⏸ 暂停防锁屏' : '▶ 开始防锁屏'}
    </button>
  )
}
