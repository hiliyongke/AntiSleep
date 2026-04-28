export function AboutSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">关于</h2>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
          <span className="text-2xl">☕</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">AntiSleep</h3>
          <p className="text-xs text-text-tertiary">v0.1.0</p>
        </div>
      </div>

      <div className="fluent-divider" />

      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          跨平台防锁屏氛围屏保工具 — 让无人值守的 AI 开发，不再被锁屏打断。
        </p>
        <p className="text-sm text-text-secondary">
          支持自定义壁纸、粒子特效叠加、跑马灯文案滚动，营造沉浸式桌面氛围。
        </p>
      </div>

      <div className="fluent-divider" />

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-text-primary">快捷键</h4>
        <div className="space-y-1.5">
          <ShortcutRow keys="⌘⇧S" desc="开启防锁屏" />
          <ShortcutRow keys="⌘⇧X" desc="关闭防锁屏" />
          <ShortcutRow keys="⌘⇧F" desc="打开屏保" />
          <ShortcutRow keys="ESC" desc="退出屏保" />
        </div>
      </div>

      <div className="fluent-divider" />

      <p className="text-xs text-text-disabled">MIT License</p>
    </div>
  )
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{desc}</span>
      <kbd className="px-2 py-0.5 rounded bg-background-light text-xs text-text-tertiary border border-border-fluent">
        {keys}
      </kbd>
    </div>
  )
}
