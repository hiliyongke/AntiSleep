import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { formatCombo } from '../../lib/format'
import type { PreventionMode, DurationOption, ThemePreference } from '../../types'

type ShortcutKey = 'shortcutEnable' | 'shortcutDisable' | 'shortcutScreensaver'

export function GeneralSettings() {
  const settings = useAppStore((s) => s.settings)
  const prevention = useAppStore((s) => s.prevention)
  const setAutoStart = useAppStore((s) => s.setAutoStart)
  const setMinimizeToTray = useAppStore((s) => s.setMinimizeToTray)
  const setExpiryWarning = useAppStore((s) => s.setExpiryWarning)
  const setExpiryWarningMinutes = useAppStore((s) => s.setExpiryWarningMinutes)
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setThemePreference = useAppStore((s) => s.setThemePreference)
  const setIdleScreensaverMinutes = useAppStore((s) => s.setIdleScreensaverMinutes)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>通用设置</h2>

      {/* Theme preference */}
      <div className="space-y-2">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>外观主题</p>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as ThemePreference[]).map((p) => (
            <button
              key={p}
              onClick={() => setThemePreference(p)}
              className={`capsule ${settings.themePreference === p ? 'capsule-active' : 'capsule-inactive'}`}
            >
              {p === 'light' ? '明亮' : p === 'dark' ? '暗黑' : '跟随系统'}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {settings.themePreference === 'system' ? '根据系统设置自动切换明暗主题' : settings.themePreference === 'dark' ? '始终使用暗黑主题' : '始终使用明亮主题'}
        </p>
      </div>

      <div className="fluent-divider" />

      {/* Auto start */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>开机自启动</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>系统启动时自动运行 AntiSleep</p>
        </div>
        <ToggleSwitch
          checked={settings.autoStart}
          onChange={() => setAutoStart(!settings.autoStart)}
        />
      </div>

      {/* Minimize to tray */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>关闭时最小化到托盘</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>点击关闭按钮时保持后台运行，而非退出应用</p>
        </div>
        <ToggleSwitch
          checked={settings.minimizeToTray}
          onChange={() => setMinimizeToTray(!settings.minimizeToTray)}
        />
      </div>

      <div className="fluent-divider" />

      {/* Default mode */}
      <div className="space-y-2">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>默认防锁屏模式</p>
        <div className="flex gap-3">
          <ModeOption
            label="防屏幕休眠"
            desc="仅阻止显示器关闭"
            active={prevention.mode === 'display'}
            onClick={() => useAppStore.getState().setPreventionMode('display')}
          />
          <ModeOption
            label="防系统休眠"
            desc="阻止整个系统进入睡眠"
            active={prevention.mode === 'system'}
            onClick={() => useAppStore.getState().setPreventionMode('system')}
          />
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Default duration */}
      <div className="space-y-2">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>默认时长</p>
        <div className="flex gap-2">
          {([30, 60, 120, null] as DurationOption[]).map((d) => (
            <button
              key={d ?? 'inf'}
              onClick={() => useAppStore.getState().setDuration(d)}
              className={`capsule ${prevention.duration === d ? 'capsule-active' : 'capsule-inactive'}`}
            >
              {d ? `${d}分钟` : '无限'}
            </button>
          ))}
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Expiry warning */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>到期前提醒</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>防锁屏即将到期时弹出提醒</p>
          </div>
          <ToggleSwitch
            checked={settings.expiryWarning}
            onChange={() => setExpiryWarning(!settings.expiryWarning)}
          />
        </div>
        {settings.expiryWarning && (
          <div className="space-y-1.5 pl-1">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>提前提醒时间</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{settings.expiryWarningMinutes} 分钟</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={settings.expiryWarningMinutes}
              onChange={(e) => setExpiryWarningMinutes(Number(e.target.value))}
              className="fluent-slider"
            />
          </div>
        )}
      </div>

      <div className="fluent-divider" />

      {/* Idle screensaver */}
      <div className="space-y-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>空闲自动屏保</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>检测到用户无操作后自动启动屏保</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>空闲时间</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {settings.idleScreensaverMinutes === 0 ? '关闭' : `${settings.idleScreensaverMinutes} 分钟`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={settings.idleScreensaverMinutes}
            onChange={(e) => setIdleScreensaverMinutes(Number(e.target.value))}
            className="fluent-slider"
          />
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>关闭</span>
            <span>60分钟</span>
          </div>
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Sound & Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>提醒音效</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>状态变化时播放提示音</p>
          </div>
          <ToggleSwitch
            checked={settings.soundEnabled}
            onChange={() => setSoundEnabled(!settings.soundEnabled)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>界面语言</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>选择应用显示语言</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => setLanguage(e.target.value as 'zh-CN' | 'en-US')}
            className="fluent-input w-28 text-xs"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Shortcuts */}
      <div className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>全局快捷键</p>
        <ShortcutRow label="开启防锁屏" storeKey="shortcutEnable" value={settings.shortcutEnable} />
        <ShortcutRow label="关闭防锁屏" storeKey="shortcutDisable" value={settings.shortcutDisable} />
        <ShortcutRow label="打开屏保" storeKey="shortcutScreensaver" value={settings.shortcutScreensaver} />
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`fluent-toggle ${checked ? 'fluent-toggle-active' : ''}`}
    >
      <span className="fluent-toggle-thumb" />
    </button>
  )
}

function ModeOption({ label, desc, active, onClick }: { label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-3 rounded-md text-left transition-all border ${
        active
          ? 'bg-accent/10 border-accent/40'
          : 'border-transparent hover:border-[var(--border-fluent-hover)]'
      }`}
      style={active ? {} : { backgroundColor: 'var(--bg-subtle)' }}
    >
      <p className={`text-sm font-medium ${active ? 'text-accent' : ''}`} style={active ? {} : { color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{desc}</p>
    </button>
  )
}

/** Key-capture shortcut row — click to record new shortcut */
function ShortcutRow({ label, value, storeKey }: { label: string; value: string; storeKey: ShortcutKey }) {
  const setShortcut = useAppStore((s) => s.setShortcut)
  const [recording, setRecording] = useState(false)

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    e.preventDefault()
    if (e.key === 'Escape') {
      setRecording(false)
      return
    }
    // Must have at least one modifier + a non-modifier key
    if (['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) return

    const parts: string[] = []
    if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
    if (e.shiftKey) parts.push('Shift')
    if (e.altKey) parts.push('Alt')
    const k = e.key.length === 1 ? e.key.toUpperCase() : e.key
    parts.push(k)

    if (parts.length < 2) return
    const combo = parts.join('+')
    await setShortcut(storeKey, combo)
    setRecording(false)
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => setRecording(true)}
        onBlur={() => setRecording(false)}
        onKeyDown={handleKeyDown}
        className={`px-2 py-0.5 rounded text-xs border transition-colors ${
          recording
            ? 'border-accent text-accent bg-accent/10'
            : 'hover:border-[var(--border-fluent-hover)]'
        }`}
        style={recording ? {} : { backgroundColor: 'var(--bg-light)', color: 'var(--text-tertiary)', borderColor: 'var(--border-fluent)' }}
      >
        {recording ? '按下新组合键…' : formatCombo(value)}
      </button>
    </div>
  )
}
