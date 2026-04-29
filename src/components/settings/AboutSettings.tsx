import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { RotateCcw } from 'lucide-react'

export function AboutSettings() {
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

      {/* Reset configuration */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: confirmReset ? '#C42B1C55' : 'var(--border-fluent)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>重置默认配置</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              将当前应用配置重置为默认状态，包括壁纸、特效、文案和快捷键。
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C42B1C18', color: '#C42B1C' }}>
            <RotateCcw size={16} />
          </div>
        </div>

        {confirmReset ? (
          <div className="space-y-3 pt-1">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              确认后将立即重置配置，当前自定义内容无法恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-md text-xs transition-colors"
                style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-secondary)', border: '1px solid var(--border-fluent)' }}
              >
                取消
              </button>
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
                确认重置
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ backgroundColor: '#C42B1C', color: '#FFFFFF' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A02318' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#C42B1C' }}
            >
              重置配置
            </button>
          </div>
        )}
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
