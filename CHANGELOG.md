# Changelog

All notable changes to **Sidereal Desk** are documented here.

## [0.3.0] — 2026-07-09

First public release. Desktop companion widget ready.

### Added

- **Location sync** — one-click GPS (with HTTPS IP fallback); manual lat/lon/elevation always available
- **First-run onboarding** — minimal prompt to sync location or enter coordinates
- **Settings guide** — one-line reference for every option and clock symbol
- **Tray menu** — Always on top · Fix position (independent toggles)
- **Minimal widget mode** — transparent dial, optional legend, tray hide-on-close
- **Time lab** — scroll scrub, speed presets (1× / 1h/s / 1d/s), step ±15m/±1h, shortcuts
- **Display modes** — Full / Compact / Minimal with persistence
- **i18n** — English & 中文 throughout UI, tray, and sky notes
- **Gray sun marker** — civil time visible below horizon (was hidden at night)
- LST verification script (`scripts/verify-lst.mjs`)

### Changed

- Sun marker: gold when up, gray when below nautical twilight (always shown)
- Location persistence: saved > IP > default Beijing
- README & docs overhaul for v0.3

### Fixed

- Minimal mode outer shadow clipping
- `displayMode` state machine (no compact/minimal boolean conflict)
- Window close now hides to tray instead of quitting

---

## [0.2.0] — internal

Initial Sidereal Desk pivot from Starmap wallpaper prototype. SVG clock, twilight theming, basic tray.

[0.3.0]: https://github.com/young/sidereal-desk/releases/tag/v0.3.0
