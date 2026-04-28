import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeMode, MarqueeSpeed, MarqueePosition, MarqueeItem } from '../../types'

export function MarqueeSettings() {
  const marquee = useAppStore((s) => s.marquee)
  const setMarqueeEnabled = useAppStore((s) => s.setMarqueeEnabled)
  const setMarqueeMode = useAppStore((s) => s.setMarqueeMode)
  const setMarqueeSpeed = useAppStore((s) => s.setMarqueeSpeed)
  const setMarqueePosition = useAppStore((s) => s.setMarqueePosition)
  const addMarqueeItem = useAppStore((s) => s.addMarqueeItem)
  const updateMarqueeItem = useAppStore((s) => s.updateMarqueeItem)
  const removeMarqueeItem = useAppStore((s) => s.removeMarqueeItem)
  const [newText, setNewText] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

      {/* Mode & Speed & Position */}
      <div className="flex gap-4 flex-wrap">
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
        <div className="space-y-1.5">
          <p className="text-xs text-text-tertiary">位置</p>
          <select
            value={marquee.position}
            onChange={(e) => setMarqueePosition(e.target.value as MarqueePosition)}
            className="fluent-input w-32"
          >
            <option value="top">顶部</option>
            <option value="center-bottom">居中偏下</option>
            <option value="bottom">底部</option>
          </select>
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Item list with per-item editor */}
      <div className="space-y-2">
        {marquee.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onUpdate={(patch) => updateMarqueeItem(item.id, patch)}
            onRemove={() => removeMarqueeItem(item.id)}
          />
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

function ItemRow({
  item,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  item: MarqueeItem
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<MarqueeItem>) => void
  onRemove: () => void
}) {
  const textShadow = item.glowEnabled
    ? `0 0 ${item.glowIntensity * 0.6}px ${item.glowColor}`
    : undefined
  return (
    <div className="rounded-md bg-background-subtle overflow-hidden">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={onToggle}
          className="flex-1 text-left text-sm truncate transition-colors hover:text-accent"
          style={{ color: item.color, textShadow }}
        >
          {item.content}
        </button>
        <button
          onClick={onRemove}
          className="text-text-tertiary hover:text-functional-error transition-colors p-1"
          title="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border-fluent/50">
          <div className="flex items-center gap-2 pt-2">
            <label className="text-xs text-text-tertiary w-16">文案</label>
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="fluent-input flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-tertiary w-16">字号</label>
            <input
              type="range"
              min="16"
              max="96"
              value={item.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="fluent-slider flex-1"
            />
            <span className="text-xs text-text-tertiary w-10 text-right">{item.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-tertiary w-16">文字色</label>
            <input
              type="color"
              value={item.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-border-fluent bg-transparent"
            />
            <span className="text-xs text-text-tertiary">{item.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-tertiary w-16">发光</label>
            <button
              onClick={() => onUpdate({ glowEnabled: !item.glowEnabled })}
              className={`fluent-toggle ${item.glowEnabled ? 'fluent-toggle-active' : ''}`}
            >
              <span className="fluent-toggle-thumb" />
            </button>
          </div>
          {item.glowEnabled && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-tertiary w-16">发光色</label>
                <input
                  type="color"
                  value={item.glowColor}
                  onChange={(e) => onUpdate({ glowColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border border-border-fluent bg-transparent"
                />
                <span className="text-xs text-text-tertiary">{item.glowColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-tertiary w-16">强度</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={item.glowIntensity}
                  onChange={(e) => onUpdate({ glowIntensity: Number(e.target.value) })}
                  className="fluent-slider flex-1"
                />
                <span className="text-xs text-text-tertiary w-10 text-right">{item.glowIntensity}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
