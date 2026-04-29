import { useState } from 'react'
import { ChevronRight, Coffee, Monitor, Palette, Zap } from 'lucide-react'

const STEPS = [
  {
    icon: Coffee,
    title: '欢迎使用 AntiSleep',
    desc: '让无人值守的 AI 开发，不再被锁屏打断。自定义壁纸、粒子特效、跑马灯文案，打造沉浸式桌面氛围。',
  },
  {
    icon: Monitor,
    title: '防锁屏模式',
    desc: '选择防屏幕休眠（仅阻止显示器关闭）或防系统休眠（阻止整个系统进入睡眠）。你随时可以在设置中修改。',
  },
  {
    icon: Zap,
    title: '智能场景',
    desc: '开启"充电时自动激活"，或指定进程运行时自动防锁屏。所有退出后自动停止，无需手动操作。',
  },
  {
    icon: Palette,
    title: '自定义屏保',
    desc: '9 种主题特效、壁纸叠加、跑马灯文案，打造属于你的桌面氛围。现在就去试试吧！',
  },
]

interface OnboardingProps {
  onComplete?: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  const handleFinish = () => {
    onComplete?.()
  }

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-mica)' }}>
      <div className="w-[360px] flex flex-col items-center gap-8 animate-fade-in">
        {/* Step icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
            boxShadow: '0 8px 32px var(--accent-color)33',
          }}
        >
          <Icon size={36} color="white" />
        </div>

        {/* Step content */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {current.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {current.desc}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? '24px' : '8px',
                backgroundColor: i === step ? 'var(--accent-color)' : 'var(--border-fluent)',
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="text-sm px-4 py-2 rounded-md transition-colors"
            style={{
              color: step === 0 ? 'transparent' : 'var(--text-secondary)',
              pointerEvents: step === 0 ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            上一步
          </button>
          <button
            onClick={() => {
              if (isLast) handleFinish()
              else setStep(step + 1)
            }}
            className="fluent-btn-primary flex items-center gap-1.5 text-sm px-5 py-2"
          >
            {isLast ? '开始使用' : '下一步'}
            {!isLast && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
