import { useAppStore } from '../../stores/appStore'
import type { PreventionMode, DurationOption } from '../../types'

export function GeneralSettings() {
  const settings = useAppStore((s) => s.settings)
  const prevention = useAppStore((s) => s.prevention)

  const toggleAutoStart = () => {
    useAppStore.setState((s) => ({ settings: { ...s.settings, autoStart: !s.settings.autoStart } }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">通用设置</h2>

      {/* Auto start */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-primary">开机自启动</p>
          <p className="text-xs text-text-tertiary">系统启动时自动运行 AntiSleep</p>
        </div>
        <ToggleSwitch
          checked={settings.autoStart}
          onChange={toggleAutoStart}
        />
      </div>

      <div className="fluent-divider" />

      {/* Default mode */}
      <div className="space-y-2">
        <p className="text-sm text-text-primary">默认防锁屏模式</p>
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
        <p className="text-sm text-text-primary">默认时长</p>
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

      {/* Shortcuts */}
      <div className="space-y-3">
        <p className="text-sm text-text-primary">全局快捷键</p>
        <ShortcutRow label="开启防锁屏" value={settings.shortcutEnable} />
        <ShortcutRow label="关闭防锁屏" value={settings.shortcutDisable} />
        <ShortcutRow label="打开屏保" value={settings.shortcutScreensaver} />
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
      className={`flex-1 p-3 rounded-md text-left transition-all ${
        active
          ? 'bg-accent/10 border border-accent/40'
          : 'bg-background-subtle border border-transparent hover:border-border-fluent-hover'
      }`}
    >
      <p className={`text-sm font-medium ${active ? 'text-accent' : 'text-text-primary'}`}>{label}</p>
      <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>
    </button>
  )
}

function ShortcutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-secondary">{label}</span>
      <kbd className="px-2 py-0.5 rounded bg-background-light text-xs text-text-tertiary border border-border-fluent">
        {value.replace('CommandOrControl', '⌘').replace('Shift', '⇧')}
      </kbd>
    </div>
  )
}
