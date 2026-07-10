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

## [0.3.2] — 2026-07-10

Release polish pass for distribution and usability.

### Added

- **Dial scale control** in Settings for resizing the sidereal dial
- **Cross-platform build scripts** for Windows, macOS, and Linux
- **GitHub Actions release workflow** for automated multi-platform builds and uploads

### Changed

- Window now hides from the Windows taskbar and is operated through the tray icon
- Location sync flow was tightened with better GPS/IP fallback behavior

### Fixed

- Improved reliability of automatic location synchronization
- Streamlined release packaging workflow for GitHub publishing

---

## [0.3.1] — 2026-07-10

Product polish release focused on presentation and packaging.

### Added

- Refined app icon set with a more elegant visual style
- Bilingual promotional landing page for product showcases
- Better build/release guidance for Windows packaging

### Changed

- Kept the project focused on the core Tauri app experience
- Refined the app’s tray-first interaction model and desktop presentation

### Fixed

- Improved the overall release readiness for GitHub distribution

---

## [0.2.0] — internal

Initial Sidereal Desk pivot from Starmap wallpaper prototype. SVG clock, twilight theming, basic tray.

[0.3.2]: https://github.com/emVisible/sidereal-desk/releases/tag/v0.3.2
[0.3.1]: https://github.com/emVisible/sidereal-desk/releases/tag/v0.3.1
[0.3.0]: https://github.com/emVisible/sidereal-desk/releases/tag/v0.3.0
