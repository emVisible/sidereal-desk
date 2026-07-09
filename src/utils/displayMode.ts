import type { AppSettings, DisplayMode } from "../store/useAppStore";

type LegacySettings = Partial<AppSettings> & {
  compact?: boolean;
  minimal?: boolean;
};

/** Migrate legacy compact/minimal booleans to displayMode. */
export function migrateSettings(saved: LegacySettings): Partial<AppSettings> {
  if (saved.displayMode) {
    const { compact: _c, minimal: _m, ...rest } = saved;
    return rest;
  }
  if (saved.minimal) return { ...saved, displayMode: "minimal" };
  if (saved.compact) return { ...saved, displayMode: "compact" };
  return { ...saved, displayMode: "full" };
}

export function isMinimal(mode: DisplayMode) {
  return mode === "minimal";
}

export function isCompact(mode: DisplayMode) {
  return mode === "compact";
}

export function cycleDisplayMode(mode: DisplayMode): DisplayMode {
  if (mode === "full") return "compact";
  if (mode === "compact") return "minimal";
  return "full";
}
