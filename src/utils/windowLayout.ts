import type { DisplayMode } from "../store/useAppStore";
import {
  getCurrentWindow,
  LogicalSize,
} from "@tauri-apps/api/window";

export type DisplayLayout = DisplayMode;

/** Window sizes tuned per layout mode. */
export const WINDOW_LAYOUT = {
  full: { width: 360, height: 520 },
  compact: { width: 320, height: 360 },
  minimal: { width: 300, height: 300 },
} as const;

export async function applyWindowLayout(displayMode: DisplayMode) {
  try {
    const win = getCurrentWindow();
    const size = WINDOW_LAYOUT[displayMode];
    await win.setSize(new LogicalSize(size.width, size.height));
  } catch {
    /* web preview */
  }
}
