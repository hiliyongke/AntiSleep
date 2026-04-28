# AntiSleep 🌙

> 跨平台防锁屏氛围屏保工具 — 让无人值守的 AI 开发，不再被锁屏打断

## 功能特性

- 🔒 **防锁屏引擎** — 系统级 API 阻止自动锁屏（macOS IOKit / Windows SetThreadExecutionState）
- 🖼️ **壁纸系统** — 支持静态图片/视频壁纸，内置精选壁纸库
- ✨ **粒子特效** — 6 种主题（矩阵代码雨、粒子网络、星空、极光、呼吸灯、时钟）
- 📜 **跑马灯文案** — 自定义文案滚动展示，水平/垂直/淡入淡出三种模式
- 🎛️ **三层渲染** — 壁纸层 + 特效层 + 文案层，独立可控
- 🧠 **智能场景** — 充电自动激活、进程检测自动激活
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
│   ├── themes/             # 粒子特效主题
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
