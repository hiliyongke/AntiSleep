import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { PinUnlock } from './PinUnlock'
import { GestureUnlock } from './GestureUnlock'

export function LockScreenOverlay() {
  const lockScreen = useAppStore((s) => s.lockScreen)

  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center">
      <div className="w-[340px] flex flex-col items-center gap-6 animate-fade-in">
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full bg-background-light/50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-text-primary">屏幕已锁定</h2>
          <p className="text-xs text-text-tertiary mt-1">
            {lockScreen.failedAttempts > 0
              ? `已失败 ${lockScreen.failedAttempts} 次`
              : '请验证身份以解锁'}
          </p>
        </div>

        {/* Unlock panel */}
        {lockScreen.lockType === 'pin' ? <PinUnlock /> : <GestureUnlock />}
      </div>
    </div>
  )
}
