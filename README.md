# Sidereal Desk

> 恒星时桌面仪 — a transparent desktop sidereal-time instrument for Windows.

A small floating clock that shows **local sidereal time (LST)**, twilight phase, moon phase, and sunrise/sunset — driven by real ephemerides, not a wallpaper.

```
pnpm install && pnpm tauri:dev
```

## Features

- SVG sidereal dial — blue LST hand, gold/gray sun marker, daylight arc
- Three layouts: Full · Compact · Minimal (desktop widget)
- Time scrubbing, speed presets, keyboard shortcuts
- Location sync (GPS → IP fallback) or manual coordinates
- System tray — hide on close, toggle show/hide, always-on-top & fix position
- English / 中文

## Shortcuts

| Key | Action |
|-----|--------|
| `,` | Settings |
| `Space` | Pause / resume |
| `R` | Back to now |
| `←` `→` | ±15 min |
| `M` | Cycle layout |
| `Esc` | Close settings / exit minimal |

## Stack

React · TypeScript · astronomy-engine · Tauri 2

## Docs

- [Product notes](docs/v0.2-sidereal-desk.md)
- [Dev setup](docs/dev-setup.md)
- [Changelog](CHANGELOG.md)

## License

MIT
