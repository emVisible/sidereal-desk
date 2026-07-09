> **补充文档** — 主文档见 [dev-setup.md](dev-setup.md)。本文保留 Windows 专项排错。

# 开发环境设置 (Windows)

## 问题 1: `link.exe` not found

Rust MSVC 工具链需要 **Visual Studio C++ 构建工具**。

### 方案 A（推荐）：安装 VS Build Tools

1. 下载：https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. 安装时勾选 **「使用 C++ 的桌面开发」**（Desktop development with C++）
3. 重启终端后验证：

```powershell
where link.exe
rustc --version
```

4. 再运行：

```powershell
pnpm tauri:dev
```

### 方案 B：使用 GNU 工具链（无需 MSVC）

若已安装 LLVM MinGW：

```powershell
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
```

确保 `gcc` 在 PATH 中，然后：

```powershell
pnpm tauri:dev
```

## 问题 2: `localhost:1420 ERR_CONNECTION_REFUSED`

这表示 **Vite 开发服务器未启动**。常见原因：

1. `pnpm tauri:dev` 在 Rust 编译阶段失败退出，Vite 也被终止
2. 只打开了 Tauri 窗口，但没有先启动前端

### 仅预览前端（不需要 Rust）

开两个终端，或只开一个：

```powershell
cd C:\Users\young\Projects\starmap-desktop
pnpm install
pnpm dev
```

浏览器访问 http://localhost:1420 即可看到星空渲染（无壁纸层/系统托盘）。

### 完整桌面应用（需先安装 C++ 构建工具）

**终端 1** — 启动前端：
```powershell
pnpm dev
```

**终端 2** — 启动 Tauri（跳过重复启动 Vite）：
```powershell
pnpm tauri:dev:only
```

或单终端（自动启动 Vite）：
```powershell
pnpm tauri:dev
```

## pnpm 命令对照

| 用途 | 命令 |
|------|------|
| 安装依赖 | `pnpm install` |
| 仅前端开发 | `pnpm dev` |
| 生成星表 | `pnpm generate-stars` |
| Tauri 开发 | `pnpm tauri:dev` |
| 打包发布 | `pnpm tauri:build` |

## Node 版本

Vite 7 建议 Node **≥ 20.19**。若遇警告可升级：

```powershell
nvm install 22
nvm use 22
```
