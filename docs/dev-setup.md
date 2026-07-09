# Sidereal Desk — 开发环境

## 前置条件

| 工具 | 版本建议 |
|------|----------|
| Node.js | ≥ 20 |
| pnpm | 9.x（见 `packageManager` 字段） |
| Rust | stable（通过 rustup） |
| Windows | VS C++ Build Tools（MSVC 工具链） |

## 快速开始

```powershell
cd C:\Users\young\Projects\starmap-desktop
pnpm install
pnpm tauri:dev    # 桌面应用（自动启动 Vite）
```

仅浏览器预览（无托盘/透明窗）：

```powershell
pnpm dev          # http://localhost:1420
```

## 常用命令

| 用途 | 命令 |
|------|------|
| 安装依赖 | `pnpm install` |
| 前端开发 | `pnpm dev` |
| 类型检查 + 构建 | `pnpm build` |
| Tauri 开发 | `pnpm tauri:dev` |
| 打包发布 | `pnpm tauri:build` |
| LST 对照脚本 | `node scripts/verify-lst.mjs` |

## Windows：Rust 编译失败

### `link.exe` not found

安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)，勾选 **「使用 C++ 的桌面开发」**，重启终端后：

```powershell
where link.exe
rustc --version
pnpm tauri:dev
```

### `localhost:1420 ERR_CONNECTION_REFUSED`

Vite 未启动。确认 `pnpm tauri:dev` 未在 Rust 编译阶段提前退出；或先 `pnpm dev` 再另开终端 `pnpm tauri dev`（跳过 beforeDevCommand 需手动协调）。

## 项目结构

```
src/
├── astronomy/skyState.ts    # LST、暮光、月相
├── components/              # SVG 钟面、设置、图例
├── core/SimulationClock.ts  # 仿真时间
├── i18n/                    # 中英 UI + 札记
├── store/                   # Zustand + Tauri Store 持久化
└── utils/                   # 窗口布局、时间偏移

src-tauri/src/
├── lib.rs                   # 托盘、关窗隐藏、命令
└── location/mod.rs          # IP 定位（HTTPS）
```

持久化（位置、设置、窗口边界）在前端 `src/store/persistence.ts`，通过 `@tauri-apps/plugin-store` 写入；Rust 侧 `set_location` 仅同步运行时坐标。

## 更多

Windows 专项排错见 [dev-setup-windows.md](dev-setup-windows.md)（历史补充）。
