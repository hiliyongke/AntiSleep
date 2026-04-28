import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeMode, MarqueeSpeed } from '../../types'

export function MarqueeSettings() {
  const marquee = useAppStore((s) => s.marquee)
  const setMarqueeEnabled = useAppStore((s) => s.setMarqueeEnabled)
  const setMarqueeMode = useAppStore((s) => s.setMarqueeMode)
  const setMarqueeSpeed = useAppStore((s) => s.setMarqueeSpeed)
  const addMarqueeItem = useAppStore((s) => s.addMarqueeItem)
  const removeMarqueeItem = useAppStore((s) => s.removeMarqueeItem)
  const [newText, setNewText] = useState('')

  const handleAdd = () => {
    if (!newText.trim()) return
    addMarqueeItem({
      id: `item-${Date.now()}`,
      content: newText.trim(),
      fontSize: 32,
      color: '#FFFFFF',
      glowEnabled: true,
      glowColor: '#0078D4',
      glowIntensity: 10,
    })
    setNewText('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">跑马灯文案</h2>
        <button
          onClick={() => setMarqueeEnabled(!marquee.enabled)}
          className={`fluent-toggle ${marquee.enabled ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      {/* Mode & Speed */}
      <div className="flex gap-4">
        <div className="space-y-1.5">
          <p className="text-xs text-text-tertiary">滚动模式</p>
          <select
            value={marquee.mode}
            onChange={(e) => setMarqueeMode(e.target.value as MarqueeMode)}
            className="fluent-input w-32"
          >
            <option value="horizontal">水平滚动</option>
            <option value="vertical">垂直翻滚</option>
            <option value="fade">淡入淡出</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-text-tertiary">速度</p>
          <select
            value={marquee.speed}
            onChange={(e) => setMarqueeSpeed(e.target.value as MarqueeSpeed)}
            className="fluent-input w-32"
          >
            <option value="slow">慢速</option>
            <option value="medium">中速</option>
            <option value="fast">快速</option>
          </select>
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Item list */}
      <div className="space-y-2">
        {marquee.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-background-subtle">
            <span className="flex-1 text-sm text-text-primary truncate">{item.content}</span>
            <button
              onClick={() => removeMarqueeItem(item.id)}
              className="text-text-tertiary hover:text-functional-error transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="输入新文案..."
          className="fluent-input flex-1"
        />
        <button onClick={handleAdd} className="fluent-btn-primary px-4">
          添加
        </button>
      </div>
    </div>
  )
}
