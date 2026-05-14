import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MarqueeMode, MarqueeSpeed, MarqueePosition, TextAnimation, MarqueeItem } from '../../types'

// ─── helpers ───────────────────────────────────────────

const positionOptions: { value: MarqueePosition; label: string }[] = [
  { value: 'top', label: '顶部居中' },
  { value: 'center', label: '正中央' },
  { value: 'center-bottom', label: '居中偏下' },
  { value: 'bottom', label: '底部居中' },
  { value: 'top-left', label: '左上' },
  { value: 'top-right', label: '右上' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-right', label: '右下' },
]

const animationOptions: { value: TextAnimation; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'pulse', label: '呼吸缩放' },
  { value: 'bounce', label: '弹跳' },
  { value: 'float', label: '漂浮' },
  { value: 'glow-pulse', label: '光晕呼吸' },
  { value: 'shake', label: '微震' },
]

const modeOptions: { value: MarqueeMode; label: string }[] = [
  { value: 'horizontal', label: '水平滚动' },
  { value: 'vertical', label: '垂直翻滚' },
  { value: 'fade', label: '淡入淡出' },
  { value: 'static', label: '静止显示' },
  { value: 'typewriter', label: '打字机' },
]

const speedOptions: { value: MarqueeSpeed; label: string }[] = [
  { value: 'slow', label: '慢速' },
  { value: 'medium', label: '中速' },
  { value: 'fast', label: '快速' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
      {children}
    </h3>
  )
}

function FieldLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-xs ${className}`} style={{ color: 'var(--text-tertiary)' }}>
      {children}
    </span>
  )
}

function SettingRow({ label, children, className = '' }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-14 shrink-0">{label}</div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// ─── main component ────────────────────────────────────

export function MarqueeSettings() {
  const marquee = useAppStore((s) => s.marquee)
  const setMarqueeEnabled = useAppStore((s) => s.setMarqueeEnabled)
  const addMarqueeItem = useAppStore((s) => s.addMarqueeItem)
  const updateMarqueeItem = useAppStore((s) => s.updateMarqueeItem)
  const removeMarqueeItem = useAppStore((s) => s.removeMarqueeItem)
  const toggleMarqueeItemEnabled = useAppStore((s) => s.toggleMarqueeItemEnabled)
  const reorderMarqueeItems = useAppStore((s) => s.reorderMarqueeItems)

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
      mode: 'fade',
      speed: 'medium',
    })
    setNewText('')
  }

  const enabledCount = marquee.items.filter((i) => i.enabled).length

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            文案设置
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {marquee.enabled ? `已启用 · ${enabledCount} 条文案` : '已禁用'}
          </p>
        </div>
        <button
          onClick={() => setMarqueeEnabled(!marquee.enabled)}
          className={`fluent-toggle ${marquee.enabled ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      {marquee.enabled && (
        <>
          {/* ── Item List ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionTitle>文案列表</SectionTitle>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {marquee.items.length} 条
              </span>
            </div>

            <div className="space-y-1.5">
              {marquee.items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={marquee.items.length}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                  onUpdate={(patch) => updateMarqueeItem(item.id, patch)}
                  onRemove={() => removeMarqueeItem(item.id)}
                  onToggleEnabled={() => toggleMarqueeItemEnabled(item.id)}
                  onMoveUp={() => {
                    if (index === 0) return
                    const next = [...marquee.items]
                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                    reorderMarqueeItems(next)
                  }}
                  onMoveDown={() => {
                    if (index >= marquee.items.length - 1) return
                    const next = [...marquee.items]
                    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                    reorderMarqueeItems(next)
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Add New ── */}
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
        </>
      )}
    </div>
  )
}

// ─── ItemRow ───────────────────────────────────────────

function ItemRow({
  item,
  index,
  total,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onToggleEnabled,
  onMoveUp,
  onMoveDown,
}: {
  item: MarqueeItem
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<MarqueeItem>) => void
  onRemove: () => void
  onToggleEnabled: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const textShadow = item.glowEnabled
    ? `0 0 ${item.glowIntensity * 0.6}px ${item.glowColor}`
    : undefined



  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-subtle)',
        border: expanded ? '1px solid var(--border-fluent-hover)' : '1px solid transparent',
      }}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-1.5 px-2 py-2">
        {/* Drag handle / order */}
        <span
          className="text-[10px] font-mono w-4 text-center select-none"
          style={{ color: 'var(--text-disabled)' }}
        >
          {index + 1}
        </span>

        {/* Visibility toggle */}
        <button
          onClick={onToggleEnabled}
          title={item.enabled ? '禁用' : '启用'}
          className="p-1 rounded transition-colors"
          style={{ color: item.enabled ? 'var(--text-secondary)' : 'var(--text-disabled)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = item.enabled ? 'var(--text-primary)' : 'var(--text-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = item.enabled ? 'var(--text-secondary)' : 'var(--text-disabled)')}
        >
          {item.enabled ? <EyeIcon /> : <EyeOffIcon />}
        </button>

        {/* Content preview (click to expand) */}
        <button
          onClick={onToggle}
          className="flex-1 text-left text-sm truncate transition-colors px-1 py-0.5 rounded"
          style={{
            color: item.color,
            textShadow: item.enabled ? textShadow : undefined,
            opacity: item.enabled ? 1 : 0.4,
          }}
        >
          {item.content || '（空文案）'}
        </button>

        {/* Quick info chips */}
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          {item.animation && item.animation !== 'none' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-lighter)', color: 'var(--text-tertiary)' }}>
              {animationOptions.find((a) => a.value === item.animation)?.label ?? item.animation}
            </span>
          )}
          {item.position && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-lighter)', color: 'var(--text-tertiary)' }}>
              {positionOptions.find((p) => p.value === item.position)?.label ?? item.position}
            </span>
          )}
        </div>

        {/* Reorder buttons */}
        <div className="flex items-center">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded transition-colors disabled:opacity-20"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { if (index > 0) e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            title="上移"
          >
            <ChevronUpIcon />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="p-1 rounded transition-colors disabled:opacity-20"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { if (index < total - 1) e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            title="下移"
          >
            <ChevronDownIcon />
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={onRemove}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D13438')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          title="删除"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-4" style={{ borderTop: '1px solid var(--border-fluent)' }}>
          {/* ── Section: Content ── */}
          <div className="space-y-2">
            <SectionTitle>内容</SectionTitle>
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="文案内容"
              className="fluent-input w-full"
            />
          </div>

          {/* ── Section: Style ── */}
          <div className="space-y-2.5">
            <SectionTitle>样式</SectionTitle>

            <SettingRow label={<FieldLabel>字号</FieldLabel>}>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={item.fontSize}
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                  className="fluent-slider flex-1"
                />
                <span className="text-xs w-10 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                  {item.fontSize}px
                </span>
              </div>
            </SettingRow>

            <SettingRow label={<FieldLabel>文字色</FieldLabel>}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent"
                  style={{ border: '1px solid var(--border-fluent)' }}
                />
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {item.color}
                </span>
              </div>
            </SettingRow>
          </div>

          {/* ── Section: Behavior ── */}
          <div className="space-y-2.5">
            <SectionTitle>行为</SectionTitle>

            <SettingRow label={<FieldLabel>滚动模式</FieldLabel>}>
              <select
                value={item.mode ?? ''}
                onChange={(e) => onUpdate({ mode: e.target.value === '' ? undefined : e.target.value as MarqueeMode })}
                className="fluent-input flex-1"
              >
                <option value="">默认（淡入淡出）</option>
                {modeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label={<FieldLabel>速度</FieldLabel>}>
              <select
                value={item.speed ?? ''}
                onChange={(e) => onUpdate({ speed: e.target.value === '' ? undefined : e.target.value as MarqueeSpeed })}
                className="fluent-input flex-1"
              >
                <option value="">默认（中速）</option>
                {speedOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SettingRow>
          </div>

          {/* ── Section: Glow ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <SectionTitle>发光特效</SectionTitle>
              <button
                onClick={() => onUpdate({ glowEnabled: !item.glowEnabled })}
                className={`fluent-toggle ${item.glowEnabled ? 'fluent-toggle-active' : ''}`}
              >
                <span className="fluent-toggle-thumb" />
              </button>
            </div>

            {item.glowEnabled && (
              <div className="space-y-2.5 pl-1">
                <SettingRow label={<FieldLabel>发光色</FieldLabel>}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.glowColor}
                      onChange={(e) => onUpdate({ glowColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent"
                      style={{ border: '1px solid var(--border-fluent)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {item.glowColor}
                    </span>
                  </div>
                </SettingRow>

                <SettingRow label={<FieldLabel>强度</FieldLabel>}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={item.glowIntensity}
                      onChange={(e) => onUpdate({ glowIntensity: Number(e.target.value) })}
                      className="fluent-slider flex-1"
                    />
                    <span className="text-xs w-10 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                      {item.glowIntensity}
                    </span>
                  </div>
                </SettingRow>
              </div>
            )}
          </div>

          {/* ── Section: Position & Animation ── */}
          <div className="space-y-2.5">
            <SectionTitle>位置与动效</SectionTitle>

            <SettingRow label={<FieldLabel>位置</FieldLabel>}>
              <select
                value={item.position ?? 'none'}
                onChange={(e) => {
                  const val = e.target.value
                  onUpdate({
                    position: val === 'none' ? undefined : (val as MarqueePosition),
                    ...(val !== 'none' ? { positionX: undefined, positionY: undefined } : {}),
                  })
                }}
                className="fluent-input flex-1"
              >
                <option value="none">默认（居中偏下）</option>
                {positionOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SettingRow>

            {/* Custom coordinates — only when no preset position is selected */}
            {item.position === undefined && (
              <div className="pl-[3.25rem] space-y-1.5">
                <FieldLabel className="block">自定义坐标</FieldLabel>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-4" style={{ color: 'var(--text-tertiary)' }}>X</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.positionX ?? 50}
                      onChange={(e) => onUpdate({ positionX: Number(e.target.value) })}
                      className="fluent-slider flex-1"
                    />
                    <span className="text-xs w-10 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                      {item.positionX ?? 50}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-4" style={{ color: 'var(--text-tertiary)' }}>Y</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.positionY ?? 50}
                      onChange={(e) => onUpdate({ positionY: Number(e.target.value) })}
                      className="fluent-slider flex-1"
                    />
                    <span className="text-xs w-10 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                      {item.positionY ?? 50}%
                    </span>
                  </div>
                </div>
                {(item.positionX != null || item.positionY != null) && (
                  <button
                    onClick={() => onUpdate({ positionX: undefined, positionY: undefined })}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #0078D4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    重置为默认坐标
                  </button>
                )}
              </div>
            )}

            <SettingRow label={<FieldLabel>动效</FieldLabel>}>
              <select
                value={item.animation ?? ''}
                onChange={(e) => onUpdate({ animation: e.target.value === '' ? undefined : (e.target.value as TextAnimation) })}
                className="fluent-input flex-1"
              >
                <option value="">默认（无动效）</option>
                {animationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SettingRow>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Icons ─────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
