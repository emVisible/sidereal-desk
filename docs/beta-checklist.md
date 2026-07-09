> **已废弃（v0.1 Starmap）** — 本文档描述旧版壁纸产品的 Beta 流程，不适用于 Sidereal Desk v0.2+。  
> 当前验收请使用 [beta-v0.2-checklist.md](beta-v0.2-checklist.md)。

# Beta Testing Checklist

## Installation
- [ ] `npm install && npm run generate-stars && npm run tauri dev` succeeds
- [ ] App appears behind desktop icons (Windows)
- [ ] Tray icon visible and functional

## Passive Mode
- [ ] World map displays with day/night terminator
- [ ] CPU usage < 1% after 60 seconds idle
- [ ] Click-through works (desktop icons clickable)
- [ ] Auto-pauses on fullscreen app launch
- [ ] Auto-pauses on battery power (Windows)

## Active Mode
- [ ] `Ctrl+Shift+S` toggles to star map
- [ ] Stars render (~9000 points)
- [ ] Planet positions roughly match sky chart for your location
- [ ] Each of 8 bodies has distinct particle effect
- [ ] Mouse drag rotates view
- [ ] Mouse wheel zooms
- [ ] `Esc` returns to passive mode

## Galaxy View
- [ ] Switch to 银河系 in HUD
- [ ] Smooth transition animation
- [ ] Milky Way band visible
- [ ] Star points in galactic coordinates

## Settings
- [ ] Location lat/lon/elevation editable
- [ ] FPS limits respected
- [ ] Settings persist across restart

## Workshop
- [ ] Export .starmap.json from editor
- [ ] Example packs in `workshop/examples/` load correctly
- [ ] `list_workshop_items` returns installed packs

## Cross-Platform
- [ ] Windows 10: wallpaper layer works
- [ ] Windows 11 24H2: wallpaper layer works
- [ ] macOS: desktop layer (degraded if stub)
- [ ] Linux X11: desktop layer (degraded if stub)

## Report Issues
File at: GitHub Issues with platform, OS version, GPU, and steps to reproduce.
