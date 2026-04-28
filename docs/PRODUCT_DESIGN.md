# AntiSleep — 跨平台防锁屏氛围屏保工具

> 让无人值守的 AI 开发，不再被锁屏打断

---

## 一、产品定位

### 1.1 一句话描述

AntiSleep 是一款跨平台（macOS / Windows）桌面工具，通过系统级 API 阻止屏幕自动锁屏，同时提供沉浸式氛围屏保体验——自定义壁纸（静态图/视频）、粒子特效叠加、跑马灯文案滚动，让桌面在无人值守时依然生动。

### 1.2 目标用户

| 用户画像 | 核心场景 |
|---------|---------|
| AI 开发者 | 长时间运行 AI 训练/推理任务，离开工位后系统自动锁屏导致远程监控中断 |
| 远程工作者 | 需要保持在线状态，避免 IM 显示"离开"或错过即时消息 |
| 演示/展示者 | 大屏展示内容时，不希望屏幕自动休眠 |
| 桌面美化爱好者 | 喜欢个性化桌面氛围，享受动态壁纸+跑马灯的视觉体验 |

### 1.3 核心价值

```
┌─────────────────────────────────────────────┐
│  防锁屏（刚需）  ×  氛围感（愉悦）  ×  个性化（表达）  │
│                                                     │
│  不只是工具，更是桌面的呼吸                          │
└─────────────────────────────────────────────┘
```

---

## 二、功能规格

### 2.1 功能全景图

```
AntiSleep
├── 🔒 防锁屏引擎
│   ├── 一键启停
│   ├── 时长选择（30m / 1h / 2h / 无限）
│   ├── 模式切换（防屏幕休眠 / 防系统休眠）
│   └── 倒计时 & 到期提醒
│
├── 🖼️ 壁纸系统
│   ├── 静态壁纸（JPG / PNG / WebP）
│   ├── 视频壁纸（MP4 / WebM，静音循环）
│   ├── 内置精选壁纸库
│   ├── 拖拽上传本地文件
│   └── 壁纸透明度调节
│
├── ✨ 粒子特效层
│   ├── 科技风 — 矩阵代码雨 / 粒子网络
│   ├── 自然风 — 星空 / 极光
│   ├── 简约风 — 呼吸灯 / 时钟
│   ├── 特效透明度调节
│   └── 特效开关
│
├── 📜 跑马灯文案
│   ├── 自定义多行文案
│   ├── 滚动模式（水平 / 垂直 / 淡入淡出）
│   ├── 字体大小 / 颜色 / 速度调节
│   ├── 文案发光效果
│   └── 跑马灯开关 & 位置
│
├── ⚙️ 设置
│   ├── 通用设置（开机自启 / 默认模式 / 快捷键）
│   ├── 智能场景（充电自动激活 / 进程检测自动激活）
│   ├── 主题偏好（动画速度 / 粒子密度 / 颜色自定义）
│   └── 关于
│
├── 🛡️ 安全锁屏
│   ├── PIN 码解锁（4-8 位数字密码）
│   ├── 手势图案解锁（3×3 九宫格滑动连线）
│   ├── 自动锁定延迟（立即 / 自定义秒数）
│   ├── 防暴力破解（5 次失败后锁定 30 秒）
│   └── 锁屏覆盖层（Fluent Acrylic 毛玻璃）
│
└── 🖥️ 系统托盘
    ├── 状态图标（活跃 / 暂停 / 即将到期）
    ├── 浮动面板（快捷操作 + 主题预览）
    └── 右键菜单
```

### 2.2 防锁屏引擎

#### 防锁屏模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 防屏幕休眠 | 阻止显示器关闭，系统仍可进入低功耗 | 远程监控、IM 在线 |
| 防系统休眠 | 阻止整个系统进入睡眠，CPU/网络持续运行 | AI 训练、下载任务 |

#### 时长控制

| 选项 | 行为 |
|------|------|
| 30 分钟 | 30 分钟后自动停止防锁屏，恢复系统默认 |
| 1 小时 | 1 小时后自动停止 |
| 2 小时 | 2 小时后自动停止 |
| 无限 | 持续防锁屏直到手动停止或应用退出 |

#### 安全保障

- 应用退出时（正常退出 / 崩溃 / 强制关闭）**必须释放**防锁屏断言，恢复系统默认行为
- 倒计时剩余 5 分钟时，状态指示灯变橙色并弹出轻量提醒
- 到期后自动释放断言，托盘图标切换为暂停状态

### 2.3 壁纸系统

#### 壁纸类型

| 类型 | 格式 | 特性 |
|------|------|------|
| 静态图片 | JPG / PNG / WebP | 全屏 cover 填充，自动适配分辨率 |
| 视频壁纸 | MP4 / WebM | 静音循环播放，自动适配分辨率 |

#### 内置壁纸（预设 5 张）

1. **深空星云** — 暗紫蓝色星云，适合搭配星空/极光特效
2. **暗夜森林** — 深绿色调，适合搭配呼吸灯特效
3. **赛博城市** — 霓虹色调，适合搭配矩阵/粒子网络特效
4. **纯黑** — 纯黑背景，让特效和文案成为主角
5. **渐变深渊** — 深蓝到黑色的柔和渐变

#### 壁纸管理

- 壁纸库网格展示，悬浮预览
- 拖拽上传区，支持批量导入
- 当前壁纸高亮标记
- 视频壁纸可暂停/播放
- 壁纸透明度滑块（0% 全透明 ~ 100% 全不透明）

### 2.4 跑马灯文案系统

#### 文案编辑

- 文案列表编辑器，支持增、删、改、拖拽排序
- 每条文案独立配置：

| 属性 | 可选值 | 默认值 |
|------|--------|--------|
| 内容 | 任意文本 | — |
| 字体大小 | 16px ~ 72px | 32px |
| 颜色 | 任意颜色 | `#FFFFFF` |
| 发光颜色 | 任意颜色 / 无 | 跟随字体颜色 |
| 发光强度 | 0 ~ 30px | 10px |

#### 滚动模式

| 模式 | 效果 | 适用场景 |
|------|------|---------|
| 水平滚动 | 文案从右向左无限循环滚动，LED 跑马灯效果 | 长文案、标语 |
| 垂直翻滚 | 文案逐行向上翻滚，新闻播报效果 | 多条短文案轮播 |
| 淡入淡出 | 文案逐条淡入展示，优雅切换 | 激励语录、待办提醒 |

#### 速度控制

- 慢速（15 秒/循环）、中速（8 秒/循环）、快速（4 秒/循环）、自定义
- 水平滚动：速度映射为 `animation-duration`
- 垂直翻滚：速度映射为每条停留时间
- 淡入淡出：速度映射为过渡时长

#### 位置

- 屏幕中下部（默认）
- 屏幕顶部
- 屏幕底部

### 2.5 粒子特效层

#### 主题规格

| 主题 | 分类 | 视觉描述 | 配色 |
|------|------|---------|------|
| 矩阵代码雨 | 科技风 | 绿色字符从上向下瀑布般倾泻 | `#16C60C` Fluent Green |
| 粒子网络 | 科技风 | 发光粒子随机漂浮，近距粒子间自动连线 | `#0078D4` Fluent Accent |
| 星空 | 自然风 | 星星闪烁，偶尔流星划过 | `#FFFFFF` 白 |
| 极光 | 自然风 | 彩色光带在屏幕上方波动 | `#16C60C` 绿 / `#0078D4` 蓝 |
| 呼吸灯 | 简约风 | 圆形光晕以呼吸节奏脉动 | `#D83B01` Fluent Orange |
| 时钟 | 简约风 | 大型极简数字时钟，秒针平滑旋转 | `#FFFFFF` 白 |

#### 可调参数

| 参数 | 范围 | 默认值 |
|------|------|--------|
| 动画速度 | 0.5x ~ 2.0x | 1.0x |
| 粒子密度 | 低 / 中 / 高 | 中 |
| 特效透明度 | 0% ~ 100% | 60% |
| 自定义主色 | 任意颜色 | 主题默认色 |

### 2.6 智能场景

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| 充电自动激活 | 检测到电源适配器连接 | 自动开始防锁屏 |
| 进程检测 | 指定进程名正在运行（如 `python`, `node`） | 自动开始防锁屏 |
| 进程退出 | 检测到目标进程全部退出 | 自动停止防锁屏 |

### 2.7 安全锁屏

当防锁屏激活期间，用户离开工位后可启用锁屏保护，防止他人操作电脑偷窥资料。

#### 解锁方式

| 方式 | 描述 | 安全等级 |
|------|------|---------|
| **PIN 码** | 4-8 位数字密码，数字键盘输入 | ★★★ |
| **手势图案** | 3×3 九宫格，滑动连接至少 3 个点 | ★★★★ |

#### 锁屏行为

| 行为 | 说明 |
|------|------|
| 自动锁定 | 屏保窗口打开后自动锁定（延迟可配置：0~60 秒） |
| 防暴力破解 | 连续 5 次验证失败后锁定 30 秒，期间禁止尝试 |
| 密码存储 | PIN/手势使用 SHA-256 加盐哈希存储，不保存明文 |
| 锁屏覆盖 | Fluent Acrylic 毛玻璃全屏覆盖层，锁定时无法操作屏保控件 |

#### 锁屏覆盖层 UI

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                    🔒                       │
│                                             │
│              屏幕已锁定                      │
│          请验证身份以解锁                    │
│                                             │
│            ● ● ○ ○                         │  ← PIN 码输入点
│                                             │
│          ┌───┬───┬───┐                     │
│          │ 1 │ 2 │ 3 │                     │
│          ├───┼───┼───┤                     │  ← 数字键盘
│          │ 4 │ 5 │ 6 │                     │
│          ├───┼───┼───┤                     │
│          │ 7 │ 8 │ 9 │                     │
│          ├───┼───┼───┤                     │
│          │   │ 0 │ ⌫ │                     │
│          └───┴───┴───┘                     │
│                                             │
└─────────────────────────────────────────────┘
```

手势图案模式为 3×3 九宫格，滑动连接圆点形成路径，路径至少连接 3 个点。

---

## 三、交互设计

### 3.1 信息架构

```
系统托盘图标
  ├── 左键点击 → 浮动面板
  └── 右键点击 → 快捷菜单
        ├── 开启/关闭防锁屏
        ├── 打开屏保窗口
        ├── 打开设置
        └── 退出

浮动面板
  ├── 状态指示 + 启停控制
  ├── 时长选择
  ├── 主题预览网格
  ├── 跑马灯文案快捷编辑
  └── 功能入口（设置 / 屏保 / 退出）

屏保窗口（全屏沉浸）
  ├── 壁纸层
  ├── 特效层
  ├── 文案层
  ├── 信息叠加（时间 + 剩余时长）
  └── 悬浮控制条（鼠标移动时浮现）

设置窗口（独立窗口）
  ├── 通用
  ├── 壁纸
  ├── 文案
  ├── 主题
  ├── 智能场景
  └── 关于
```

### 3.2 托盘浮动面板

**尺寸**：380px × 480px，Fluent Acrylic 背景（blur 30px + noise + exclusion blend），圆角 8px

```
┌─────────────────────────────────────┐
│  ┌──────────────────────────────┐   │
│  │  🟢 防锁屏已激活              │   │  ← 状态指示器（呼吸灯 + 文字）
│  │     剩余 1:23:45             │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │     [ ⏸ 暂停防锁屏 ]         │   │  ← 大型圆角按钮，带涟漪效果
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─────┐┌─────┐┌─────┐┌─────┐     │
│  │30m  ││ 1h  ││ 2h  ││  ∞  │     │  ← 时长选择胶囊组
│  └─────┘└─────┘└─────┘└─────┘     │  ← 选中态渐变高亮
│                                     │
│  ┌──────┐┌──────┐┌──────┐          │
│  │ 矩阵 ││ 粒子 ││ 星空 │          │  ← 主题缩略图网格（2×3）
│  └──────┘└──────┘└──────┘          │  ← 悬浮微缩放 + 发光边框
│  ┌──────┐┌──────┐┌──────┐          │
│  │ 极光 ││ 呼吸 ││ 时钟 │          │
│  └──────┘└──────┘└──────┘          │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  ▶ AI 训练进行中，请勿锁屏...  │   │  ← 当前跑马灯文案预览条
│  └──────────────────────────────┘   │  ← 点击可快速编辑
│                                     │
│  ⚙ 设置    🖥 屏保    ✕ 退出        │  ← 底部功能按钮
└─────────────────────────────────────┘
```

#### 交互细节

| 交互 | 行为 |
|------|------|
| 状态指示器 | 绿色脉冲呼吸灯=激活，灰色静态=暂停，橙色快闪=即将到期 |
| 启停按钮 | 点击切换防锁屏状态，带涟漪扩散动画 |
| 时长胶囊 | 点击切换时长，选中态带 Fluent Accent 渐变（`#0078D4` → `#005A9E`），非选中态半透明 |
| 主题缩略图 | 悬浮时 scale(1.05) + 外发光边框，点击切换并播放主题预览动画 |
| 文案预览条 | 显示当前跑马灯文案，点击打开文案快捷编辑弹窗 |
| 面板外部点击 | 面板自动关闭 |

### 3.3 屏保全屏窗口

**全屏无边框**，三层叠加渲染：

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  19:06  ⏱ 1:23:45  🟢                                   │  ← 信息叠加层
│                                                         │  （左上角，半透明）
│                                                         │
│                                                         │
│          ✨ 粒子特效动画叠加 ✨                           │  ← 特效层
│                                                         │  （Canvas，半透明）
│                                                         │
│                                                         │
│  ── ▶ AI 训练进行中，请勿锁屏 │ 保持专注，持续创造 ──▶  │  ← 跑马灯文案层
│                                                         │  （屏幕中下部，发光文字）
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  ⏱ 1:23:45  │  🎨 🖼 📜  │  ░░░░░  │  ✕  │    │    │  ← 悬浮控制条
│  └─────────────────────────────────────────────────┘    │  （底部中央，3s 自动隐藏）
│                     🖼 壁纸层（底层）                     │
└─────────────────────────────────────────────────────────┘
```

#### 三层渲染架构

```
┌─────────────────────────────────┐
│  Layer 3: 文案层（CSS 动画）     │  z-index: 30
│  - 跑马灯文字                    │
│  - 时间/状态信息                 │
├─────────────────────────────────┤
│  Layer 2: 特效层（Canvas）       │  z-index: 20
│  - 粒子动画                      │
│  - 图形特效                      │
├─────────────────────────────────┤
│  Layer 1: 壁纸层（video/img）    │  z-index: 10
│  - 静态图片 / 视频背景           │
│  - 纯黑（无壁纸时）              │
└─────────────────────────────────┘
```

#### 悬浮控制条

**触发**：鼠标移动时从底部平滑淡入，3 秒无操作后淡出

| 控件 | 功能 |
|------|------|
| 进度环 | 显示剩余时长，点击暂停/继续 |
| 🎨 主题图标 | 快速切换粒子特效主题 |
| 🖼 壁纸图标 | 快速切换壁纸 |
| 📜 文案图标 | 快速开关跑马灯 |
| 透明度滑块 | 调节特效层+文案层整体透明度 |
| ✕ 关闭 | 关闭屏保窗口（防锁屏不中断） |

#### 交互细节

| 交互 | 行为 |
|------|------|
| 鼠标静止 | 3 秒后悬浮控制条和鼠标光标同时淡出，纯沉浸 |
| 鼠标移动 | 控制条和光标淡入 |
| ESC 键 | 关闭屏保窗口，防锁屏继续 |
| 窗口隐藏 | 暂停 Canvas 动画帧和视频播放，节省 CPU/GPU |
| 窗口显示 | 恢复 Canvas 动画帧和视频播放 |

### 3.4 设置面板

**独立窗口**：600px × 700px，Fluent Mica 背景，左侧竖向标签导航

```
┌────────┬──────────────────────────────────────────┐
│        │                                          │
│  通用  │  开机自启动            [🔘]              │
│        │                                          │
│  壁纸  │  默认防锁屏模式                           │
│        │  ○ 防屏幕休眠  ● 防系统休眠              │
│  文案  │                                          │
│        │  默认时长                                 │
│  主题  │  ├──────●──────────┤ 1h                  │
│        │                                          │
│  智能  │  全局快捷键                               │
│        │  开启防锁屏: ⌘⇧S                         │
│  关于  │  关闭防锁屏: ⌘⇧X                         │
│        │  打开屏保:   ⌘⇧F                         │
│        │                                          │
└────────┴──────────────────────────────────────────┘
```

#### 壁纸设置标签

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 深空 │ │ 森林 │ │ 赛博 │ │ 纯黑 │           │  ← 内置壁纸网格
│  │  ✓   │ │      │ │      │ │      │           │  ← 当前选中打勾
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│  ┌──────┐ ┌──────────────────────────┐           │
│  │ 渐变 │ │                          │           │
│  │      │ │   拖拽上传壁纸文件         │           │  ← 拖拽上传区
│  └──────┘ │   JPG / PNG / WebP / MP4 │           │
│           │                          │           │
│           └──────────────────────────┘           │
│                                                  │
│  壁纸透明度  ├──────────●────┤ 80%               │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 文案设置标签

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  滚动模式  [水平滚动 ▼]                          │  ← 下拉选择
│  速度      [中速 ▼]                              │
│  位置      [屏幕中下部 ▼]                        │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ ⋮⋮  AI 训练进行中，请勿锁屏          [✎] [🗑]│  │  ← 文案列表
│  │ ⋮⋮  保持专注，持续创造                [✎] [🗑]│  │  ← 拖拽排序
│  │ ⋮⋮  代码即信仰                        [✎] [🗑]│  │  ← 编辑/删除
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [+ 添加文案]                                    │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │  ▶ 实时预览区域                            │  │  ← 实时预览
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 文案编辑弹窗（点击列表中的 ✎）

```
┌────────────────────────────────────┐
│  编辑文案                          │
│                                    │
│  内容                              │
│  ┌──────────────────────────────┐  │
│  │ AI 训练进行中，请勿锁屏       │  │
│  └──────────────────────────────┘  │
│                                    │
│  字体大小  [32px ▼]               │
│  颜色      [⬜ #FFFFFF]           │
│  发光效果  [🔘 开启]              │
│  发光颜色  [⬜ #FFFFFF]           │
│  发光强度  ├──●────────┤ 10px    │
│                                    │
│  [取消]              [保存]        │
└────────────────────────────────────┘
```

---

## 四、视觉规范 — Microsoft Fluent Design Acrylic

### 4.1 设计关键词

**Fluent Design · Acrylic · Mica · Reveal Highlight · Dark Mode · Immersive · Micro-animations · Premium**

### 4.2 设计体系

采用微软 Fluent Design System 的暗色主题，核心使用两种材质：

| 材质 | 用途 | 特征 |
|------|------|------|
| **Acrylic（亚克力）** | 浮动面板、弹窗、悬浮控制条 | 30px 模糊 + 噪点纹理 + 排除混合 + 色调叠加，通透有深度 |
| **Mica（云母）** | 设置窗口背景、标题栏 | 仅取桌面壁纸色采样 + 极淡噪点，沉稳不干扰 |

### 4.3 Acrylic 四层结构

```
┌───────────────────────────────────────┐
│  Layer 4: 色调覆盖层 (Tint Overlay)    │  rgba(44,44,44,0.65) + exclusion blend
├───────────────────────────────────────┤
│  Layer 3: 排除混合层 (Exclusion Blend) │  半透明色彩排除混合，增加深度感
├───────────────────────────────────────┤
│  Layer 2: 噪点纹理层 (Noise Texture)   │  2-4% 透明度的 SVG 颗粒噪声
├───────────────────────────────────────┤
│  Layer 1: 背景模糊层 (Blur Sample)     │  blur(30px) saturate(150%)
└───────────────────────────────────────┘
         ↓ 透过内容看到背景 ↓
```

### 4.4 色彩系统 — Fluent Dark Theme

#### Accent Colors（强调色）

| 用途 | 色值 | 说明 |
|------|------|------|
| 主强调色 | `#0078D4` | Fluent 标准 Accent Blue |
| Hover 态 | `#1a86d9` | 鼠标悬浮 |
| Active 态 | `#005A9E` | 按下/选中 |
| Subtle 填充 | `rgba(0,120,212,0.15)` | 弱化背景 |

#### Surface Colors（表面色）

| 用途 | 色值 | 说明 |
|------|------|------|
| 屏保底色 | `#000000` | 最深层 |
| Mica 窗口 | `#202020` | 设置窗口背景 |
| 面板背景 | `#1C1C1E` | 浮动面板 |
| 卡片/提升面 | `#2C2C2E` | 卡片、输入框 |
| Hover 表面 | `#3A3A3C` | 鼠标悬浮 |
| Subtle 填充 | `rgba(255,255,255,0.04)` | 极弱填充 |

#### Semantic Colors（语义色）

| 用途 | 色值 | 说明 |
|------|------|------|
| 成功/激活 | `#0F7B0F` | Fluent Success Green |
| 警告/即将到期 | `#D83B01` | Fluent Caution Orange |
| 错误/删除 | `#D13438` | Fluent Error Red |

#### Text Colors（文字色）

| 层级 | 色值 | 不透明度 |
|------|------|---------|
| Primary | `#FFFFFF` | 100% |
| Secondary | `rgba(255,255,255,0.60)` | 60% |
| Tertiary | `rgba(255,255,255,0.35)` | 35% |
| Disabled | `rgba(255,255,255,0.20)` | 20% |

### 4.5 Acrylic / Mica CSS 参数

```css
/* ═══ Acrylic Standard — 面板、弹窗、悬浮控制条 ═══ */
.acrylic {
  position: relative;
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  background-color: rgba(44, 44, 44, 0.65);
  background-blend-mode: exclusion;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.06),
    0 12px 24px rgba(0, 0, 0, 0.06);
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* 噪点伪元素 */
.acrylic::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("data:image/svg+xml,...");  /* SVG 噪点 */
  background-size: 128px 128px;
  opacity: 0.03;  /* 2-4% 噪点不透明度 */
}

/* ═══ Mica — 设置窗口背景 ═══ */
.mica {
  position: relative;
  background-color: rgba(32, 32, 32, 0.80);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.mica::after {
  /* 极淡噪点 1-2% */
  opacity: 0.015;
}
```

#### Acrylic 变体对比

| 变体 | 色调不透明度 | 模糊 | 噪点 | 用途 |
|------|------------|------|------|------|
| Standard | `rgba(44,44,44,0.65)` | 30px | 3% | 浮动面板、弹窗 |
| Light | `rgba(44,44,44,0.50)` | 30px | 2% | 悬浮控制条、内联覆盖 |
| Subtle | `rgba(44,44,46,0.40)` | 12px | — | 芯片、小元素 |

### 4.6 Reveal Highlight（鼠标追踪光晕）

Fluent 标志性交互效果——鼠标悬浮时元素边缘出现追踪光晕：

```css
.reveal::before {
  background: radial-gradient(
    circle 200px at var(--reveal-x) var(--reveal-y),
    rgba(255, 255, 255, 0.12) 0%,
    transparent 100%
  );
}

.reveal-border::before {
  border-image: radial-gradient(
    circle 200px at var(--reveal-x) var(--reveal-y),
    rgba(255, 255, 255, 0.45) 0%,
    transparent 100%
  ) 1;
}
```

通过 JS 监听 `mousemove` 事件更新 `--reveal-x` / `--reveal-y` CSS 变量。

### 4.7 Fluent Elevation（Z 深度阴影）

| 层级 | Z 值 | 阴影 | 用途 |
|------|------|------|------|
| Rest | Z=0 | 无阴影 | 窗口底色 |
| Elevation-1 | Z=1 | `0 1px 2px + 0 2px 4px` | 卡片、列表项 |
| Elevation-2 | Z=2 | `0 1px 2px + 0 4px 8px + 0 12px 24px` | 浮动面板、弹窗 |
| Elevation-3 | Z=3 | `0 2px 4px + 0 8px 16px + 0 28px 48px` | 模态对话框 |

光照方向：**左上方光源**，模拟顶部自然光。

### 4.8 字体

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| 标题 | 20px | 600 (SemiBold) | 面板标题 |
| 副标题 | 14px | 500 (Medium) | 区域标签 |
| 正文 | 13px | 400 (Regular) | 一般内容 |
| 跑马灯 | 16~72px | 300~600 | 用户自定义 |

字体族：`'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`

> Windows 上优先使用 Segoe UI Variable（Win11），回退到 Segoe UI（Win10）；macOS 上回退到系统字体。

### 4.9 Fluent 动效规范

#### 缓动曲线

| 名称 | 值 | 用途 |
|------|---|------|
| Decelerate | `cubic-bezier(0.16, 1, 0.3, 1)` | 进入、展开、出现 |
| Accelerate | `cubic-bezier(0.7, 0, 1, 0.5)` | 退出、收起、消失 |
| Standard | `cubic-bezier(0.33, 0, 0.67, 1)` | 一般过渡 |

#### 动效时序

| 动效 | 时长 | 缓动 | 应用场景 |
|------|------|------|---------|
| 进入 | 150~300ms | Decelerate | 面板打开、元素出现 |
| 退出 | 100~200ms | Accelerate | 面板关闭、元素消失 |
| 重定向 | ≤150ms | Standard | 状态切换、属性变化 |
| 呼吸脉冲 | 2s loop | ease-in-out | 状态指示灯 |
| 涟漪扩散 | 600ms | ease-out | 按钮点击 |
| Reveal | 200ms | Decelerate | 鼠标光晕显现/消失 |
| 跑马灯 | 用户设定 | linear | 文案滚动 |

#### 核心动效列表

| 动效 | 参数 | 应用场景 |
|------|------|---------|
| 呼吸脉冲 | `scale(1.0 → 1.15)`, 2s ease-in-out infinite | 状态指示灯 |
| 涟漪扩散 | `scale(0 → 2.5)`, 600ms ease-out | 按钮点击 |
| 淡入 | `opacity(0→1) + translateY(8px→0) + scale(0.98→1)`, 300ms Decelerate | 面板打开 |
| 淡出 | `opacity(1→0) + scale(1→0.96)`, 200ms Accelerate | 面板关闭 |
| 缩放弹跳 | `scale(0.95 → 1.02 → 1.0)`, 250ms | 主题缩略图点击 |
| 滑入 | `translateY(20px → 0)`, 300ms Decelerate | 悬浮控制条 |
| 发光呼吸 | `text-shadow` intensity pulse | 跑马灯文案 |
| Accent 光晕 | `box-shadow` accent color pulse | 激活态强调 |

### 4.10 圆角规范 — WinUI3 标准

| 元素 | 圆角 | 说明 |
|------|------|------|
| 窗口 | 8px | WinUI3 标准窗口圆角 |
| 面板 | 8px | 统一 8px |
| 按钮 | 8px | 统一 8px |
| 卡片/缩略图 | 8px | 统一 8px |
| 输入框 | 6px | 略小于标准 |
| 胶囊标签 | full (9999px) | 药丸形态 |

> **核心原则**：WinUI3 将所有交互元素统一为 **8px 圆角**，仅胶囊标签和输入框例外。

### 4.11 边框规范

| 场景 | 色值 | 宽度 |
|------|------|------|
| 默认边框 | `rgba(255,255,255,0.08)` | 1px |
| Hover 边框 | `rgba(255,255,255,0.14)` | 1px |
| Active 边框 | `rgba(255,255,255,0.04)` | 1px |
| Accent 边框 | `rgba(0,120,212,0.40)` | 1px |
| Focus 下划线 | `#0078D4` | 2px (bottom only) |

### 4.12 Fluent 组件样式 Token

| 组件 | 背景 | 边框 | 文字色 |
|------|------|------|--------|
| 默认按钮 | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.85)` |
| 主按钮 | `#0078D4` | `rgba(255,255,255,0.08)` | `#FFFFFF` |
| 选中胶囊 | 渐变 `#0078D4→#005A9E` | `rgba(0,120,212,0.40)` | `#FFFFFF` |
| 未选胶囊 | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.60)` |
| 输入框 | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` | `#FFFFFF` |
| Toggle 开 | `#0078D4` | `rgba(0,120,212,0.50)` | — |
| Toggle 关 | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.15)` | — |
| 分隔线 | — | — | `rgba(255,255,255,0.06)` 1px |

---

## 五、技术方案

### 5.1 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Tauri 2.0 | 2.x |
| 前端 | React + TypeScript | React 18 / TS 5 |
| 样式 | Tailwind CSS | 3.4.17 |
| 构建 | Vite | 5.x |
| 状态管理 | Zustand | 5.x |
| 后端 | Rust | 2021 edition |
| 屏保渲染 | HTML5 Canvas + CSS Animations | — |
| 数据持久化 | Tauri Store 插件 | 2.x |

### 5.2 跨平台防锁屏实现

#### macOS — IOKit

```rust
// 通过 core-foundation crate 调用 IOKit API
#[cfg(target_os = "macos")]
pub fn start_prevention(mode: PreventionMode) -> Result<u32, String> {
    let assertion_type = match mode {
        PreventionMode::PreventDisplaySleep => 
            kIOPMAssertPreventUserIdleDisplaySleep,
        PreventionMode::PreventSystemSleep => 
            kIOPMAssertPreventUserIdleSystemSleep,
    };
    let mut assertion_id: u32 = 0;
    let result = unsafe {
        IOPMAssertionCreateWithName(
            assertion_type,
            kIOPMAssertionLevelOn,
            CFStringRef::from("AntiSleep Prevention"),
            &mut assertion_id,
        )
    };
    // 返回 assertion_id 用于后续释放
}

#[cfg(target_os = "macos")]
pub fn stop_prevention(assertion_id: u32) -> Result<(), String> {
    unsafe { IOPMAssertionRelease(assertion_id) }
}
```

#### Windows — SetThreadExecutionState

```rust
// 通过 windows-sys crate 调用 Win32 API
#[cfg(target_os = "windows")]
pub fn start_prevention(mode: PreventionMode) -> Result<(), String> {
    let flags = match mode {
        PreventionMode::PreventDisplaySleep => 
            ES_CONTINUOUS | ES_DISPLAY_REQUIRED,
        PreventionMode::PreventSystemSleep => 
            ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED,
    };
    unsafe { SetThreadExecutionState(flags) };
    Ok(())
}

#[cfg(target_os = "windows")]
pub fn stop_prevention() -> Result<(), String> {
    unsafe { SetThreadExecutionState(ES_CONTINUOUS) };
    Ok(())
}
```

### 5.3 前端架构

#### 组件树

```
App
├── TrayPanelWindow        // 托盘浮动面板窗口
│   ├── StatusIndicator    // 状态呼吸灯
│   ├── ToggleButton       // 启停按钮
│   ├── DurationSelector   // 时长胶囊组
│   ├── ThemePreviewGrid   // 主题缩略图
│   └── MarqueePreview     // 文案预览条
│
├── ScreensaverWindow      // 屏保全屏窗口
│   ├── WallpaperLayer     // 壁纸层 (video/img)
│   ├── EffectLayer        // 特效层 (Canvas)
│   ├── MarqueeLayer       // 文案层 (CSS动画)
│   ├── InfoOverlay        // 信息叠加 (时间+状态)
│   └── FloatingControls   // 悬浮控制条
│
└── SettingsWindow         // 设置窗口
    ├── GeneralSettings
    ├── WallpaperSettings
    ├── MarqueeSettings
    ├── ThemeSettings
    ├── SmartSceneSettings
    └── AboutSettings
```

#### 状态管理（Zustand Store）

```typescript
interface AppState {
  // 防锁屏状态
  prevention: {
    active: boolean;
    mode: 'display' | 'system';
    duration: number | null; // null = 无限
    startTime: number | null;
    assertionId: number | null; // macOS 用
  };
  
  // 壁纸状态
  wallpaper: {
    current: WallpaperSource;
    opacity: number;
    builtIn: WallpaperSource[];
    custom: WallpaperSource[];
  };
  
  // 主题状态
  theme: {
    current: ThemeId;
    opacity: number;
    speed: number;
    density: 'low' | 'medium' | 'high';
    enabled: boolean;
    customColor: string;
  };
  
  // 跑马灯状态
  marquee: {
    enabled: boolean;
    items: MarqueeItem[];
    mode: 'horizontal' | 'vertical' | 'fade';
    speed: 'slow' | 'medium' | 'fast' | number;
    position: 'top' | 'center-bottom' | 'bottom';
  };
  
  // 智能场景
  smartScene: {
    autoOnCharge: boolean;
    processNames: string[];
  };
}
```

#### 主题渲染器接口

```typescript
interface ThemeRenderer {
  id: string;
  name: string;
  category: 'tech' | 'nature' | 'minimal';
  thumbnail: string;
  
  init(canvas: HTMLCanvasElement, config: ThemeConfig): void;
  render(deltaTime: number): void;
  resize(width: number, height: number): void;
  destroy(): void;
}
```

### 5.4 Tauri 配置要点

#### Cargo.toml 核心依赖

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# macOS
[target.'cfg(target_os = "macos")'.dependencies]
core-foundation = "0.10"

# Windows
[target.'cfg(target_os = "windows")'.dependencies]
windows-sys = { version = "0.59", features = [
  "Win32_System_Power",
  "Win32_Foundation"
] }
```

#### tauri.conf.json 关键配置

```json
{
  "app": {
    "withGlobalTauri": true,
    "trayIcon": {
      "id": "main-tray",
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    },
    "windows": [
      {
        "label": "main",
        "visible": false
      }
    ]
  }
}
```

#### 权限声明 (capabilities/default.json)

```json
{
  "permissions": [
    "core:default",
    "core:tray:allow-new",
    "core:tray:allow-set-icon",
    "core:tray:allow-set-tooltip",
    "fs:default",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-exists",
    "fs:allow-read-dir",
    "dialog:default",
    "dialog:allow-open",
    "shell:allow-open"
  ]
}
```

### 5.5 多窗口管理

Tauri 2.0 支持多窗口，AntiSleep 需要 3 个窗口：

| 窗口 Label | 用途 | 尺寸 | 特性 |
|-------------|------|------|------|
| `main` | 隐藏主窗口（不显示） | — | `visible: false` |
| `tray-panel` | 托盘浮动面板 | 380×480 | 无边框，毛玻璃，跟随托盘位置 |
| `screensaver` | 屏保全屏窗口 | 全屏 | 无边框，透明背景，全屏 |
| `settings` | 设置面板 | 600×700 | 标准窗口，可调整大小 |

---

## 六、项目目录结构

```
AntiSleep/
├── docs/
│   └── PRODUCT_DESIGN.md           # 本文档
│
├── src/                             # 前端源码
│   ├── main.tsx                     # React 入口
│   ├── App.tsx                      # 应用根组件
│   ├── styles/
│   │   └── globals.css              # Tailwind 全局样式 + 跑马灯 @keyframes
│   │
│   ├── components/
│   │   ├── tray/
│   │   │   ├── TrayPanel.tsx        # 托盘浮动面板
│   │   │   ├── StatusIndicator.tsx  # 状态呼吸灯
│   │   │   ├── ToggleButton.tsx     # 启停按钮
│   │   │   ├── DurationSelector.tsx # 时长胶囊组
│   │   │   ├── ThemePreviewGrid.tsx # 主题缩略图网格
│   │   │   └── MarqueePreview.tsx   # 文案预览条
│   │   │
│   │   ├── screensaver/
│   │   │   ├── ScreensaverWindow.tsx # 屏保窗口容器
│   │   │   ├── WallpaperLayer.tsx   # 壁纸渲染层
│   │   │   ├── EffectLayer.tsx      # Canvas 特效层
│   │   │   ├── MarqueeLayer.tsx     # 跑马灯文案层
│   │   │   ├── FloatingControls.tsx # 悬浮控制条
│   │   │   └── InfoOverlay.tsx      # 信息叠加层
│   │   │
│   │   └── settings/
│   │       ├── SettingsPanel.tsx     # 设置面板主组件
│   │       ├── GeneralSettings.tsx   # 通用设置
│   │       ├── WallpaperSettings.tsx # 壁纸管理
│   │       ├── MarqueeSettings.tsx   # 文案编辑
│   │       ├── ThemeSettings.tsx     # 主题偏好
│   │       ├── SmartSceneSettings.tsx # 智能场景
│   │       └── AboutSettings.tsx     # 关于
│   │
│   ├── themes/
│   │   ├── types.ts                 # ThemeRenderer 接口
│   │   ├── registry.ts              # 主题注册表
│   │   ├── matrix.ts                # 矩阵代码雨
│   │   ├── particle-network.ts      # 粒子网络
│   │   ├── starfield.ts             # 星空
│   │   ├── aurora.ts                # 极光
│   │   ├── breathing-light.ts       # 呼吸灯
│   │   └── clock.ts                 # 时钟
│   │
│   ├── marquee/
│   │   ├── types.ts                 # 跑马灯类型定义
│   │   ├── engine.ts                # 文案队列管理 & 轮播调度
│   │   └── animations.ts            # CSS 动画配置
│   │
│   ├── wallpaper/
│   │   ├── types.ts                 # 壁纸类型定义
│   │   └── manager.ts               # 壁纸加载/切换/预加载
│   │
│   ├── hooks/
│   │   ├── useSleepPrevention.ts    # 防锁屏状态管理
│   │   ├── useSettings.ts           # 设置状态管理
│   │   └── useScreensaver.ts        # 屏保窗口控制
│   │
│   ├── stores/
│   │   └── appStore.ts              # Zustand 全局状态
│   │
│   └── lib/
│       └── tauri-commands.ts        # Tauri Command 封装
│
├── src-tauri/                        # Rust 后端
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   └── src/
│       ├── main.rs                   # Tauri 入口
│       ├── commands.rs               # Command 定义
│       ├── sleep_prevention.rs       # 防锁屏核心（跨平台分发）
│       ├── platform/
│       │   ├── mod.rs
│       │   ├── macos.rs              # macOS IOKit 实现
│       │   └── windows.rs            # Windows Win32 实现
│       ├── power_monitor.rs          # 电源状态监听
│       └── tray.rs                   # 托盘菜单构建
│
├── assets/
│   ├── wallpapers/                   # 内置壁纸（5 张）
│   └── icons/                        # 托盘图标
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 七、实现优先级

### Phase 1 — MVP（核心可用）

1. Rust 防锁屏核心（macOS IOKit + Windows SetThreadExecutionState）
2. 系统托盘 + 基础浮动面板（启停 + 时长选择）
3. 屏保全屏窗口 + 纯黑背景 + 信息叠加

### Phase 2 — 氛围体验

4. 6 个粒子特效主题
5. 壁纸系统（静态图 + 视频）
6. 跑马灯文案引擎

### Phase 3 — 个性化 & 智能

7. 设置面板完整实现
8. 智能场景自动激活
9. 快捷键支持

---

## 八、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 防锁屏断言未释放 | 系统无法正常休眠，耗电 | 应用退出时强制释放，Tauri on_window_event 监听 CloseRequested |
| 视频壁纸 CPU/GPU 占用高 | 风扇噪音、发热 | 窗口不可见时暂停视频+Canvas，限制视频分辨率 |
| macOS IOKit 权限问题 | 防锁屏失效 | 不使用沙盒模式，或引导用户授权 |
| Canvas 动画帧率过高 | CPU 占用 | 使用 requestAnimationFrame 自然适配刷新率，暂停时 cancelAnimationFrame |
| 大文件壁纸加载慢 | 白屏闪烁 | 预加载下一张壁纸，显示加载进度 |
| Windows 防锁屏需管理员权限 | 部分功能不可用 | SetThreadExecutionState 通常不需要管理员权限，文档说明 |

---

> **AntiSleep** — 守护你的屏幕，点亮你的桌面 ☕
