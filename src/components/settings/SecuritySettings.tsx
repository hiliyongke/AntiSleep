import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { LockType } from '../../types'

export function SecuritySettings() {
  const lockScreen = useAppStore((s) => s.lockScreen)
  const setLockEnabled = useAppStore((s) => s.setLockEnabled)
  const setLockType = useAppStore((s) => s.setLockType)
  const setPinCode = useAppStore((s) => s.setPinCode)
  const setGesturePattern = useAppStore((s) => s.setGesturePattern)
  const setAutoLockDelay = useAppStore((s) => s.setAutoLockDelay)

  const [showPinSetup, setShowPinSetup] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')

  const handlePinSetup = async () => {
    if (pinInput.length < 4) {
      setPinError('PIN 码至少 4 位')
      return
    }
    if (pinInput !== pinConfirm) {
      setPinError('两次输入不一致')
      return
    }
    await setPinCode(pinInput)
    setShowPinSetup(false)
    setPinInput('')
    setPinConfirm('')
    setPinError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">安全设置</h2>
      </div>

      {/* Enable lock */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-primary">启用屏幕锁</p>
          <p className="text-xs text-text-tertiary">屏保激活后需验证身份才能退出</p>
        </div>
        <button
          onClick={() => setLockEnabled(!lockScreen.enabled)}
          className={`fluent-toggle ${lockScreen.enabled ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      {lockScreen.enabled && (
        <>
          <div className="fluent-divider" />

          {/* Lock type */}
          <div className="space-y-2">
            <p className="text-sm text-text-primary">解锁方式</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLockType('pin')}
                className={`flex-1 p-3 rounded-md flex flex-col items-center gap-2 transition-all ${
                  lockScreen.lockType === 'pin'
                    ? 'bg-accent/10 border border-accent/40'
                    : 'bg-background-subtle border border-transparent hover:border-border-fluent-hover'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={lockScreen.lockType === 'pin' ? 'text-accent' : 'text-text-secondary'}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className={`text-xs ${lockScreen.lockType === 'pin' ? 'text-accent' : 'text-text-secondary'}`}>
                  PIN 码
                </span>
              </button>
              <button
                onClick={() => setLockType('gesture')}
                className={`flex-1 p-3 rounded-md flex flex-col items-center gap-2 transition-all ${
                  lockScreen.lockType === 'gesture'
                    ? 'bg-accent/10 border border-accent/40'
                    : 'bg-background-subtle border border-transparent hover:border-border-fluent-hover'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={lockScreen.lockType === 'gesture' ? 'text-accent' : 'text-text-secondary'}>
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
                </svg>
                <span className={`text-xs ${lockScreen.lockType === 'gesture' ? 'text-accent' : 'text-text-secondary'}`}>
                  手势图案
                </span>
              </button>
            </div>
          </div>

          {/* PIN setup */}
          {lockScreen.lockType === 'pin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-primary">设置 PIN 码</p>
                {lockScreen.pinHash && (
                  <span className="text-xs text-functional-success">已设置</span>
                )}
              </div>
              {!showPinSetup ? (
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="fluent-btn text-sm"
                >
                  {lockScreen.pinHash ? '修改 PIN 码' : '设置 PIN 码'}
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-md bg-background-subtle">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError('') }}
                    placeholder="输入 4-8 位 PIN 码"
                    maxLength={8}
                    className="fluent-input"
                  />
                  <input
                    type="password"
                    value={pinConfirm}
                    onChange={(e) => { setPinConfirm(e.target.value); setPinError('') }}
                    placeholder="确认 PIN 码"
                    maxLength={8}
                    className="fluent-input"
                  />
                  {pinError && <p className="text-xs text-functional-error">{pinError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPinSetup(false); setPinInput(''); setPinConfirm(''); setPinError('') }} className="fluent-btn flex-1">取消</button>
                    <button onClick={handlePinSetup} className="fluent-btn-primary flex-1">确认</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gesture setup info */}
          {lockScreen.lockType === 'gesture' && (
            <div className="space-y-2">
              <p className="text-sm text-text-primary">手势图案</p>
              <p className="text-xs text-text-tertiary">
                {lockScreen.gestureHash
                  ? '手势图案已设置。下次锁定时可在屏保中使用手势解锁。'
                  : '首次锁定时将引导您设置手势图案。'}
              </p>
              {lockScreen.gestureHash && (
                <button
                onClick={() => {
                  // Reset gesture - will prompt on next lock
                  useAppStore.setState((s) => ({ lockScreen: { ...s.lockScreen, gestureHash: null } }))
                }}
                  className="fluent-btn text-sm"
                >
                  重新设置手势
                </button>
              )}
            </div>
          )}

          <div className="fluent-divider" />

          {/* Auto lock delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-primary">自动锁定延迟</p>
              <span className="text-xs text-text-tertiary">
                {lockScreen.autoLockDelay === 0 ? '立即' : `${lockScreen.autoLockDelay}秒`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={lockScreen.autoLockDelay}
              onChange={(e) => setAutoLockDelay(Number(e.target.value))}
              className="fluent-slider"
            />
            <p className="text-xs text-text-tertiary">屏保激活后多久自动锁定屏幕</p>
          </div>
        </>
      )}
    </div>
  )
}
