import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'

export function SmartSceneSettings() {
  const smartScene = useAppStore((s) => s.smartScene)
  const setAutoOnCharge = useAppStore((s) => s.setAutoOnCharge)
  const setProcessNames = useAppStore((s) => s.setProcessNames)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">智能场景</h2>

      {/* Auto on charge */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-primary">充电时自动激活</p>
          <p className="text-xs text-text-tertiary">检测到电源适配器连接时自动开始防锁屏</p>
        </div>
        <button
          onClick={() => setAutoOnCharge(!smartScene.autoOnCharge)}
          className={`fluent-toggle ${smartScene.autoOnCharge ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      <div className="fluent-divider" />

      {/* Process detection */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-text-primary">进程检测自动激活</p>
          <p className="text-xs text-text-tertiary">指定进程运行时自动开始防锁屏，全部退出后自动停止</p>
        </div>
        <div className="space-y-2">
          {smartScene.processNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-text-primary px-3 py-1.5 rounded-md bg-background-subtle">
                {name}
              </span>
              <button
                onClick={() => setProcessNames(smartScene.processNames.filter((_, j) => j !== i))}
                className="text-text-tertiary hover:text-functional-error transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
          <ProcessInput onAdd={(name) => setProcessNames([...smartScene.processNames, name])} />
        </div>
      </div>
    </div>
  )
}

function ProcessInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="输入进程名，如 python"
        className="fluent-input flex-1"
      />
      <button onClick={handleSubmit} className="fluent-btn">
        添加
      </button>
    </div>
  )
}
