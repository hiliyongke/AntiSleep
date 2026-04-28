---
name: macOS-anti-lock-screen-tool
overview: 在当前工作区下新建一个 Swift/SwiftUI 原生 macOS 项目，创建防锁屏小工具。包含完整的产品设计文档，涵盖产品定位、功能设计、技术方案、屏保主题系统等。
design:
  styleKeywords:
    - macOS Native
    - Dark Mode
    - Vibrancy
    - Immersive
    - Minimalist
  fontSystem:
    fontFamily: SF Pro
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#0A84FF"
      - "#30D158"
      - "#FF9F0A"
    background:
      - "#1C1C1E"
      - "#2C2C2E"
      - "#000000"
    text:
      - "#FFFFFF"
      - "#8E8E93"
    functional:
      - "#30D158"
      - "#FF453A"
      - "#FF9F0A"
todos:
  - id: write-design-doc
    content: 编写完整产品设计文档到 AntiSleep/docs/PRODUCT_DESIGN.md
    status: pending
  - id: init-xcode-project
    content: 初始化 Xcode 项目结构与 Swift Package 配置
    status: pending
    dependencies:
      - write-design-doc
  - id: impl-prevention-engine
    content: 实现 IOKit 防锁屏核心服务 SleepPreventionManager
    status: pending
    dependencies:
      - init-xcode-project
  - id: impl-menubar-app
    content: 实现菜单栏应用入口与 MenuBarView 交互
    status: pending
    dependencies:
      - impl-prevention-engine
  - id: impl-themes
    content: 实现屏保主题系统与 6 个内置主题动画
    status: pending
    dependencies:
      - impl-menubar-app
  - id: impl-screensaver-window
    content: 实现屏保全屏窗口与悬浮控件
    status: pending
    dependencies:
      - impl-themes
  - id: impl-settings
    content: 实现设置面板与智能场景配置
    status: pending
    dependencies:
      - impl-menubar-app
---

## 产品概述

AntiSleep 是一款 macOS 原生防锁屏工具，专为 AI 开发无人值守场景设计。应用以菜单栏常驻形态运行，同时提供可展开的屏保可视化窗口，兼具实用性与趣味性。

## 核心功能

- **防锁屏引擎**：通过系统级 API 阻止 macOS 自动锁屏/休眠，支持防屏幕休眠、防系统休眠、防磁盘休眠三种模式
- **菜单栏控制**：常驻右上角菜单栏图标，一键启停防锁屏，显示当前状态与倒计时
- **屏保可视化窗口**：全屏可展开窗口，展示动态动画效果，兼具防锁屏与视觉美化作用
- **多主题系统**：科技风（矩阵代码雨、粒子网络）、自然风（星空、极光）、简约风（呼吸灯、时钟）等多种可切换主题
- **个性化设置**：自定义防锁屏时长、自动启停规则、主题偏好、透明度等参数
- **智能场景**：检测到充电状态/特定应用运行时自动激活防锁屏

## 技术栈

- **语言**：Swift 5.9+
- **UI 框架**：SwiftUI (macOS 13+)
- **最低系统**：macOS 13 Ventura (MenuBarExtra 依赖)
- **防锁屏 API**：IOKit framework (IOPMAssertionCreateWithName)
- **动画渲染**：SwiftUI TimelineView + Canvas
- **数据持久化**：@AppStorage (UserDefaults)
- **构建工具**：Xcode 15+ / Swift Package Manager

## 实现方案

### 防锁屏机制

使用 IOKit 的 `IOPMAssertionCreateWithName` 创建电源断言，这是 macOS 官方推荐的防休眠方式，比 `caffeinate` 命令更可控：

- `kIOPMAssertPreventUserIdleSystemSleep` — 阻止系统休眠
- `kIOPMAssertPreventUserIdleDisplaySleep` — 阻止屏幕休眠
- 通过 `IOPMAssertionRelease` 释放断言来恢复系统默认行为

### 菜单栏架构

使用 SwiftUI `MenuBarExtra` (macOS 13+) 实现常驻菜单栏，支持：

- 状态图标动态切换（活跃/暂停/错误）
- 下拉菜单快捷操作
- 点击展开屏保窗口

### 屏保窗口架构

- 独立 WindowGroup 作为屏保展示窗口
- 使用 `TimelineView` 驱动动画帧更新
- `Canvas` 绘制高性能粒子/图形动画
- 支持窗口透明度调节，不影响后台观察

### 主题系统

- 定义 `ScreensaverTheme` 协议，每个主题实现自己的渲染逻辑
- 主题通过枚举注册，支持后续扩展
- 主题配置（颜色、速度、密度）可通过设置面板自定义

## 目录结构

```
/Users/yorke/Desktop/cloud5/AntiSleep/
├── docs/
│   └── PRODUCT_DESIGN.md    # [NEW] 产品设计文档，完整的产品规划、功能规格、交互设计、技术方案
├── AntiSleep/
│   ├── AntiSleepApp.swift    # [NEW] 应用入口，注册 MenuBarExtra 与 WindowGroup
│   ├── Models/
│   │   ├── SleepPreventionMode.swift  # [NEW] 防锁屏模式枚举（系统/屏幕/磁盘）
│   │   ├── AppSettings.swift          # [NEW] 用户设置模型，@AppStorage 持久化
│   │   └── ThemeConfig.swift          # [NEW] 主题配置模型
│   ├── Services/
│   │   └── SleepPreventionManager.swift  # [NEW] IOKit 防锁屏核心服务
│   ├── Views/
│   │   ├── MenuBarView.swift        # [NEW] 菜单栏下拉视图
│   │   ├── ScreensaverWindow.swift  # [NEW] 屏保全屏窗口
│   │   └── SettingsView.swift       # [NEW] 设置面板视图
│   ├── Themes/
│   │   ├── ScreensaverTheme.swift    # [NEW] 主题协议定义
│   │   ├── MatrixTheme.swift         # [NEW] 科技风-矩阵代码雨主题
│   │   ├── ParticleNetworkTheme.swift # [NEW] 科技风-粒子网络主题
│   │   ├── StarfieldTheme.swift      # [NEW] 自然风-星空主题
│   │   ├── AuroraTheme.swift         # [NEW] 自然风-极光主题
│   │   ├── BreathingLightTheme.swift  # [NEW] 简约风-呼吸灯主题
│   │   └── ClockTheme.swift          # [NEW] 简约风-时钟主题
│   └── Helpers/
│       └── PowerMonitor.swift        # [NEW] 电源状态监听，支持智能场景
├── AntiSleep.xcodeproj/             # [NEW] Xcode 项目文件
└── README.md                         # [NEW] 项目说明
```

## 实现备注

- IOPMAssertionCreateWithName 需要在 Info.plist 中声明 `com.apple.security.cs.allow-unsigned-executable-memory` 权限（若使用沙盒则需额外处理）
- 菜单栏应用需设置 `LSUIElement = true` 隐藏 Dock 图标
- TimelineView 的 schedule 应适配屏幕刷新率，避免不必要的 CPU 占用
- 防锁屏断言生命周期必须严格管理，应用退出时必须释放，否则系统无法正常休眠

## 设计风格

采用 macOS 原生设计语言，融合毛玻璃质感与暗色主题，与系统 UI 风格无缝融合。屏保窗口以深色为底，搭配主题动画，营造沉浸感。

## 页面规划

### 1. 菜单栏下拉面板

- **状态指示区**：圆形呼吸灯图标，绿色=防锁屏激活，灰色=未激活，橙色=即将到期
- **快捷操作区**：大型启停按钮 + 时长选择（30分钟/1小时/2小时/无限）
- **主题切换区**：横向滚动缩略图预览，点击切换
- **底部功能区**：设置入口、屏保窗口入口、退出

### 2. 屏保全屏窗口

- **全屏沉浸**：黑色背景 + 主题动画，无边框
- **悬浮控件**：鼠标移动时底部浮现控制条（进度、主题切换、透明度、关闭）
- **信息叠加**：左上角显示当前时间与防锁屏剩余时长，半透明不干扰观感

### 3. 设置面板

- **通用设置**：开机自启、默认防锁屏模式、默认时长
- **智能场景**：充电时自动激活、指定应用运行时自动激活
- **主题偏好**：默认主题、动画速度、粒子密度、颜色自定义
- **关于**：版本信息、使用说明