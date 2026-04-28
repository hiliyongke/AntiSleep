import { useState } from 'react'
import { GeneralSettings } from './GeneralSettings'
import { WallpaperSettings } from './WallpaperSettings'
import { MarqueeSettings } from './MarqueeSettings'
import { ThemeSettings } from './ThemeSettings'
import { SmartSceneSettings } from './SmartSceneSettings'
import { SecuritySettings } from './SecuritySettings'
import { AboutSettings } from './AboutSettings'
import { Settings, Image, ScrollText, Palette, Zap, Shield, Info } from 'lucide-react'

const TABS = [
  { id: 'general', name: '通用', icon: Settings },
  { id: 'wallpaper', name: '壁纸', icon: Image },
  { id: 'marquee', name: '文案', icon: ScrollText },
  { id: 'theme', name: '主题', icon: Palette },
  { id: 'smart', name: '智能', icon: Zap },
  { id: 'security', name: '安全', icon: Shield },
  { id: 'about', name: '关于', icon: Info },
] as const

type TabId = typeof TABS[number]['id']

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />
      case 'wallpaper': return <WallpaperSettings />
      case 'marquee': return <MarqueeSettings />
      case 'theme': return <ThemeSettings />
      case 'smart': return <SmartSceneSettings />
      case 'security': return <SecuritySettings />
      case 'about': return <AboutSettings />
    }
  }

  return (
    <div className="w-full h-full bg-[#202020] rounded-lg flex overflow-hidden">
      {/* Sidebar */}
      <nav className="w-[140px] flex-shrink-0 border-r border-border-fluent py-3 px-2 flex flex-col gap-0.5">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
              }`}
            >
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5">
        {renderContent()}
      </main>
    </div>
  )
}
