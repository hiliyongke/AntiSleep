import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { formatCombo } from '../../lib/format'
import { RotateCcw } from 'lucide-react'

export function AboutSettings() {
  const settings = useAppStore((s) => s.settings)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>关于</h2>

      {/* App identity */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
          <span className="text-2xl">☕</span>
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AntiSleep</h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>v0.1.0</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>跨平台防锁屏氛围屏保工具</p>
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Description */}
      <div className="space-y-2">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          让无人值守的 AI 开发，不再被锁屏打断。
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          支持自定义壁纸、粒子特效叠加、跑马灯文案滚动，营造沉浸式桌面氛围。
        </p>
      </div>

      <div className="fluent-divider" />

      {/* Features */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>核心功能</h4>
        <div className="grid grid-cols-2 gap-2">
          <FeatureCard icon="🔒" title="防锁屏" desc="阻止系统自动休眠" />
          <FeatureCard icon="🖼️" title="氛围屏保" desc="壁纸+特效+文案" />
          <FeatureCard icon="⚡" title="智能场景" desc="充电/进程自动激活" />
        </div>
      </div>

      <div className="fluent-divider" />

      {/* Keyboard shortcuts */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>快捷键</h4>
        <div className="space-y-1.5">
          <ShortcutRow keys={formatCombo(settings.shortcutEnable)} desc="开启防锁屏" />
          <ShortcutRow keys={formatCombo(settings.shortcutDisable)} desc="关闭防锁屏" />
          <ShortcutRow keys={formatCombo(settings.shortcutScreensaver)} desc="打开屏保" />
          <ShortcutRow keys="ESC" desc="退出屏保" />
        </div>
      </div>

      <div className="fluent-divider" />

      {/* System info */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>系统信息</h4>
        <InfoRow label="技术栈" value="Tauri 2 + React 18 + Rust" />
        <InfoRow label="渲染引擎" value="Canvas + CSS Animations" />
        <InfoRow label="状态管理" value="Zustand + Tauri Store" />
      </div>

      <div className="fluent-divider" />

      {/* Factory reset */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>数据管理</h4>
        {confirmReset ? (
          <div className="p-3 rounded-md space-y-2" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-fluent)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>确定要恢复出厂设置吗？</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>所有设置（壁纸、特效、文案、快捷键等）将恢复为默认值，此操作不可撤销。</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  useAppStore.getState().resetToFactory()
                  setConfirmReset(false)
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: '#C42B1C' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A02318' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C42B1C' }}
              >
                确认恢复
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-md text-xs transition-colors"
                style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-secondary)', border: '1px solid var(--border-fluent)' }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full p-2.5 rounded-md flex items-center gap-2.5 text-left transition-colors border border-transparent hover:border-[var(--border-fluent-hover)]"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={16} style={{ color: '#C42B1C' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>恢复出厂设置</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>清除所有自定义设置，恢复为默认值</p>
            </div>
          </button>
        )}
      </div>

      <div className="fluent-divider" />

      {/* Links & license */}
      <div className="space-y-2">
        <div className="flex gap-3">
          <a
            href="https://github.com/nicepkg/antisleep"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://github.com/nicepkg/antisleep/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            反馈问题
          </a>
          <a
            href="https://github.com/nicepkg/antisleep#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            使用文档
          </a>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>MIT License &copy; 2024-2026 AntiSleep</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-2.5 rounded-md flex items-start gap-2" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{desc}</p>
      </div>
    </div>
  )
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
      <kbd className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-tertiary)', border: '1px solid var(--border-fluent)' }}>
        {keys}
      </kbd>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}


