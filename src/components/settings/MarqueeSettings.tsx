import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeMode, MarqueeSpeed, MarqueePosition, TextAnimation, MarqueeItem } from '../../types'

export function MarqueeSettings() {
  const marquee = useAppStore((s) => s.marquee)
  const setMarqueeEnabled = useAppStore((s) => s.setMarqueeEnabled)
  const setMarqueeMode = useAppStore((s) => s.setMarqueeMode)
  const setMarqueeSpeed = useAppStore((s) => s.setMarqueeSpeed)
  const setMarqueePosition = useAppStore((s) => s.setMarqueePosition)
  const setMarqueeAnimation = useAppStore((s) => s.setMarqueeAnimation)
  const setMarqueeDisplayStrategy = useAppStore((s) => s.setMarqueeDisplayStrategy)
  const addMarqueeItem = useAppStore((s) => s.addMarqueeItem)
  const updateMarqueeItem = useAppStore((s) => s.updateMarqueeItem)
  const removeMarqueeItem = useAppStore((s) => s.removeMarqueeItem)
  const toggleMarqueeItemEnabled = useAppStore((s) => s.toggleMarqueeItemEnabled)
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
      enabled: true,
    })
    setNewText('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>文案设置</h2>
        <button
          onClick={() => setMarqueeEnabled(!marquee.enabled)}
          className={`fluent-toggle ${marquee.enabled ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      {/* Global controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>滚动模式</p>
          <select
            value={marquee.mode}
            onChange={(e) => setMarqueeMode(e.target.value as MarqueeMode)}
            className="fluent-input w-full"
          >
            <option value="horizontal">水平滚动</option>
            <option value="vertical">垂直翻滚</option>
            <option value="fade">淡入淡出</option>
            <option value="static">静止显示</option>
            <option value="typewriter">打字机</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>速度</p>
          <select
            value={marquee.speed}
            onChange={(e) => setMarqueeSpeed(e.target.value as MarqueeSpeed)}
            className="fluent-input w-full"
          >
            <option value="slow">慢速</option>
            <option value="medium">中速</option>
            <option value="fast">快速</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>默认位置</p>
          <select
            value={marquee.position}
            onChange={(e) => setMarqueePosition(e.target.value as MarqueePosition)}
            className="fluent-input w-full"
          >
            <option value="top">顶部居中</option>
            <option value="center">正中央</option>
            <option value="center-bottom">居中偏下</option>
            <option value="bottom">底部居中</option>
            <option value="top-left">左上</option>
            <option value="top-right">右上</option>
            <option value="bottom-left">左下</option>
            <option value="bottom-right">右下</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>全局动效</p>
          <select
            value={marquee.animation}
            onChange={(e) => setMarqueeAnimation(e.target.value as TextAnimation)}
            className="fluent-input w-full"
          >
            <option value="none">无</option>
            <option value="pulse">呼吸缩放</option>
            <option value="bounce">弹跳</option>
            <option value="float">漂浮</option>
            <option value="glow-pulse">光晕呼吸</option>
            <option value="shake">微震</option>
          </select>
        </div>
      </div>

      {/* Display strategy */}
      <div className="space-y-2">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>显示策略</p>
        <div className="flex gap-2">
          {(['single', 'cycle', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setMarqueeDisplayStrategy(s)}
              className={`capsule ${marquee.displayStrategy === s ? 'capsule-active' : 'capsule-inactive'}`}
            >
              {s === 'single' ? '单条' : s === 'cycle' ? '轮播' : '全部'}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {marquee.displayStrategy === 'single' && '始终只显示第一条启用的文案'}
          {marquee.displayStrategy === 'cycle' && '按顺序轮播所有启用的文案'}
          {marquee.displayStrategy === 'all' && '同时显示所有启用的文案（每条可独立设置位置）'}
        </p>
      </div>

      <div className="fluent-divider" />

      {/* Item list */}
      <div className="space-y-2">
        {marquee.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onUpdate={(patch) => updateMarqueeItem(item.id, patch)}
            onRemove={() => removeMarqueeItem(item.id)}
            onToggleEnabled={() => toggleMarqueeItemEnabled(item.id)}
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
  onToggleEnabled,
}: {
  item: MarqueeItem
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<MarqueeItem>) => void
  onRemove: () => void
  onToggleEnabled: () => void
}) {
  const textShadow = item.glowEnabled
    ? `0 0 ${item.glowIntensity * 0.6}px ${item.glowColor}`
    : undefined
  return (
    <div className="rounded-md overflow-hidden border border-transparent" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={onToggleEnabled}
          title={item.enabled ? '禁用' : '启用'}
          className="transition-colors p-1"
          style={{ color: item.enabled ? 'var(--text-secondary)' : 'var(--text-disabled)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = item.enabled ? 'var(--text-primary)' : 'var(--text-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = item.enabled ? 'var(--text-secondary)' : 'var(--text-disabled)')}
        >
          {item.enabled ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
        </button>
        <button
          onClick={onToggle}
          className="flex-1 text-left text-sm truncate transition-colors"
          style={{ color: item.color, textShadow: item.enabled ? textShadow : undefined, opacity: item.enabled ? 1 : 0.5 }}
        >
          {item.content}
        </button>
        <button
          onClick={onRemove}
          className="transition-colors p-1"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D13438')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          title="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid var(--border-fluent)' }}>
          <div className="flex items-center gap-2 pt-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>文案</label>
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="fluent-input flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>字号</label>
            <input
              type="range"
              min="16"
              max="96"
              value={item.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="fluent-slider flex-1"
            />
            <span className="text-xs w-10 text-right" style={{ color: 'var(--text-tertiary)' }}>{item.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>文字色</label>
            <input
              type="color"
              value={item.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer bg-transparent"
              style={{ border: '1px solid var(--border-fluent)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>发光</label>
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
                <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>发光色</label>
                <input
                  type="color"
                  value={item.glowColor}
                  onChange={(e) => onUpdate({ glowColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent"
                  style={{ border: '1px solid var(--border-fluent)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.glowColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>强度</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={item.glowIntensity}
                  onChange={(e) => onUpdate({ glowIntensity: Number(e.target.value) })}
                  className="fluent-slider flex-1"
                />
                <span className="text-xs w-10 text-right" style={{ color: 'var(--text-tertiary)' }}>{item.glowIntensity}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>动效</label>
            <select
              value={item.animation ?? ''}
              onChange={(e) => onUpdate({ animation: e.target.value === '' ? undefined : (e.target.value as TextAnimation) })}
              className="fluent-input flex-1"
            >
              <option value="">跟随全局</option>
              <option value="none">无</option>
              <option value="pulse">呼吸缩放</option>
              <option value="bounce">弹跳</option>
              <option value="float">漂浮</option>
              <option value="glow-pulse">光晕呼吸</option>
              <option value="shake">微震</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>位置</label>
            <select
              value={item.position ?? 'none'}
              onChange={(e) => onUpdate({ position: e.target.value === 'none' ? undefined : (e.target.value as MarqueePosition) })}
              className="fluent-input flex-1"
            >
              <option value="none">跟随全局</option>
              <option value="top">顶部居中</option>
              <option value="center">正中央</option>
              <option value="center-bottom">居中偏下</option>
              <option value="bottom">底部居中</option>
              <option value="top-left">左上</option>
              <option value="top-right">右上</option>
              <option value="bottom-left">左下</option>
              <option value="bottom-right">右下</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
