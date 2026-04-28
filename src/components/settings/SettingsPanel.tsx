import { useState } from 'react'
import { GeneralSettings } from './GeneralSettings'
import { WallpaperSettings } from './WallpaperSettings'
import { MarqueeSettings } from './MarqueeSettings'
import { ThemeSettings } from './ThemeSettings'
import { SmartSceneSettings } from './SmartSceneSettings'
import { AboutSettings } from './AboutSettings'
import { PreviewSettings } from './PreviewSettings'
import { Settings, Image, ScrollText, Sparkles, Zap, Info, PanelRightOpen } from 'lucide-react'

const TABS = [
  { id: 'general', name: '通用', icon: Settings },
  { id: 'wallpaper', name: '壁纸', icon: Image },
  { id: 'marquee', name: '文案', icon: ScrollText },
  { id: 'theme', name: '特效', icon: Sparkles },
  { id: 'smart', name: '智能', icon: Zap },
  { id: 'about', name: '关于', icon: Info },
] as const

type TabId = typeof TABS[number]['id']

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [showPreview, setShowPreview] = useState(true)

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />
      case 'wallpaper': return <WallpaperSettings />
      case 'marquee': return <MarqueeSettings />
      case 'theme': return <ThemeSettings />
      case 'smart': return <SmartSceneSettings />
      case 'about': return <AboutSettings />
    }
  }

  return (
    <div className="w-screen h-screen flex" style={{ backgroundColor: 'var(--bg-mica)' }}>
      {/* Sidebar */}
      <nav className="w-[140px] flex-shrink-0 border-r py-3 px-2 flex flex-col gap-0.5" style={{ borderColor: 'var(--border-fluent)' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
              style={isActive
                ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }
                : { color: 'var(--text-secondary)' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
          style={{
            backgroundColor: showPreview ? 'var(--bg-subtle)' : 'transparent',
            color: showPreview ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            if (!showPreview) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }
          }}
        >
          <PanelRightOpen size={16} />
          <span>预览</span>
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5" style={{ minWidth: 0, maxWidth: '40%' }}>
        {renderContent()}
      </main>

      {/* Right preview panel — fills remaining space */}
      {showPreview && (
        <aside
          className="flex-1 border-l flex flex-col"
          style={{ minWidth: 0, borderColor: 'var(--border-fluent)', backgroundColor: 'var(--bg-mica)' }}
        >
          <PreviewSettings compact />
        </aside>
      )}
    </div>
  )
}
