> **已废弃（v0.1 Starmap）** — 平台矩阵描述旧版壁纸/探索器双窗架构。

# Platform Support Matrix

## Windows 10/11

| Feature | Status | Implementation |
|---------|--------|----------------|
| Wallpaper layer (WorkerW) | Implemented | `src-tauri/src/lib.rs` `attach_to_workerw` |
| Click-through (passive) | Stub | `desktop_layer/windows.rs` |
| Fullscreen game pause | Implemented | `resource_mgr/mod.rs` |
| Battery pause | Implemented | `resource_mgr/mod.rs` |
| Multi-monitor | Basic | `resource_mgr::get_monitors` |
| Global hotkey | Implemented | `tauri-plugin-global-shortcut` |
| System tray | Implemented | `lib.rs` `setup_tray` |

**Win11 24H2 note:** WorkerW technique includes Progman fallback. Monitor `tauri-plugin-wallpaper` updates.

## macOS 12+

| Feature | Status | Implementation |
|---------|--------|----------------|
| Desktop layer | Stub | `desktop_layer/macos.rs` — requires `kCGDesktopWindowLevel - 1` via objc |
| Click-through | Stub | NSWindow `ignoresMouseEvents` |
| Battery pause | N/A | Not implemented |
| Multi-monitor | Planned | NSScreen enumeration |
| Global hotkey | Implemented | `tauri-plugin-global-shortcut` |
| System tray | Implemented | Tauri tray |

**Limitation:** Lock screen wallpaper not supported (macOS architectural constraint).

## Linux

| Feature | Status | Implementation |
|---------|--------|----------------|
| X11 desktop layer | Stub | `desktop_layer/linux.rs` — `_NET_WM_WINDOW_TYPE_DESKTOP` |
| Wayland layer-shell | Stub | gtk-layer-shell / wlr-layer-shell |
| Battery pause | N/A | Not implemented |
| Multi-monitor | Basic | Monitor enumeration planned |
| Global hotkey | Implemented | `tauri-plugin-global-shortcut` |
| System tray | Implemented | Tauri tray |

**Compositor compatibility:** Test on GNOME (Wayland), KDE (Wayland), Sway (wlr-layer-shell).

## Build Requirements

- **Windows:** Visual Studio Build Tools 2019+ with C++ workload
- **macOS:** Xcode Command Line Tools
- **Linux:** `build-essential`, `libwebkit2gtk-4.1-dev`, `libssl-dev`

## Performance Targets

| Mode | Target CPU | Target GPU |
|------|-----------|-----------|
| Passive | < 1% | ~0% |
| Active (local sky) | 2–5% | Low |
| Active (galaxy) | 5–10% | Medium |

Run `npm run tauri dev` on each platform to validate wallpaper layer behavior.
