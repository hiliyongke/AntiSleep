import { useState, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'

const PIN_LENGTH = 4

export function PinUnlock() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const unlockWithPin = useAppStore((s) => s.unlockWithPin)
  const lockScreen = useAppStore((s) => s.lockScreen)

  const handleDigit = useCallback((digit: string) => {
    setError(false)
    if (pin.length >= PIN_LENGTH) return

    const newPin = pin + digit
    setPin(newPin)

    if (newPin.length === PIN_LENGTH) {
      // Verify after short delay for visual feedback
      setTimeout(async () => {
        const success = await unlockWithPin(newPin)
        if (!success) {
          setError(true)
          setTimeout(() => {
            setPin('')
            setError(false)
          }, 600)
        }
      }, 150)
    }
  }, [pin, unlockWithPin])

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }, [])

  const isLocked = lockScreen.failedAttempts >= 5 && lockScreen.lastFailedTime !== null &&
    Date.now() - lockScreen.lastFailedTime < 30000

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* PIN dots */}
      <div className="flex gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              i < pin.length
                ? error
                  ? 'bg-functional-error scale-110'
                  : 'bg-accent scale-110'
                : 'bg-background-lighter/50'
            }`}
          />
        ))}
      </div>

      {isLocked && (
        <p className="text-xs text-functional-error">
          尝试次数过多，请等待 30 秒
        </p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2.5 w-[240px]">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key) => {
          if (key === '') return <div key="empty" />
          if (key === '⌫') {
            return (
              <button
                key="del"
                onClick={handleDelete}
                className="h-14 rounded-md bg-background-light/30 hover:bg-background-lighter/50 flex items-center justify-center text-text-secondary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            )
          }
          return (
            <button
              key={key}
              onClick={() => !isLocked && handleDigit(key)}
              disabled={isLocked}
              className={`h-14 rounded-md text-xl font-medium transition-all duration-150 ${
                isLocked
                  ? 'bg-background-light/10 text-text-disabled cursor-not-allowed'
                  : 'bg-background-light/30 hover:bg-background-lighter/50 active:bg-accent/20 active:scale-95 text-text-primary'
              }`}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
