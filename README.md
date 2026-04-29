# AntiSleep 🌙

> 跨平台防锁屏氛围屏保工具 — 让无人值守的 AI 开发，不再被锁屏打断

## 功能特性

- 🔒 **防锁屏引擎** — 系统级防休眠实现（macOS `caffeinate` / Windows `SetThreadExecutionState`）
- 🖼️ **壁纸系统** — 支持静态图片/视频壁纸，内置精选壁纸库，高斯模糊 + 透明度调节
- ✨ **9 种主题特效** — 矩阵代码雨、粒子网络、星空、极光、呼吸灯、时钟、萤火之森、流体波纹、霓虹几何
- 📜 **跑马灯文案** — 自定义文案滚动展示，支持水平滚动/垂直翻滚/淡入淡出/静止显示/打字机五种模式
- 🎛️ **多层渲染** — 壁纸层 + 特效层 + 文案层 + 信息浮层，独立可控
- 🧠 **智能场景** — 充电自动激活、进程检测自动激活
- ⏰ **到期提醒** — 防锁屏即将到期时系统通知提醒
- 🖥️ **空闲屏保** — 检测用户空闲自动启动氛围屏保
- 🎬 **首次引导** — 新用户首次启动时展示功能引导
- 👁️ **整体预览** — 设置面板中实时预览所有配置组合效果
- 🖥️ **系统托盘** — 常驻托盘，一键启停

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Tauri 2.0 (Rust + Web) |
| 前端 | React 18 + TypeScript 5 |
| 样式 | Tailwind CSS 3.4 |
| 构建 | Vite 5 |
| 状态 | Zustand 5 |
| 后端 | Rust 2021 Edition |

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

## 项目结构

```
AntiSleep/
├── src/                    # 前端源码 (React + TypeScript)
│   ├── components/         # UI 组件
│   │   ├── onboarding/     # 首次引导
│   │   ├── screensaver/    # 屏保窗口
│   │   ├── settings/       # 设置面板
│   │   └── tray/           # 托盘面板
│   ├── themes/             # 9 种特效主题
│   ├── marquee/            # 跑马灯引擎
│   ├── wallpaper/          # 壁纸管理
│   ├── hooks/              # React Hooks
│   ├── stores/             # Zustand Store
│   └── lib/                # Tauri Command 封装
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── platform/       # 平台特定实现 (macOS/Windows)
│       ├── commands.rs     # Tauri Command
│       └── tray.rs         # 系统托盘
└── docs/                   # 文档
    └── PRODUCT_DESIGN.md   # 产品设计文档
```

## 许可

MIT License
