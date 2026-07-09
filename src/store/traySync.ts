import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "./useAppStore";

export function syncTrayMenu(settings: AppSettings) {
  invoke("update_tray_menu", {
    locale: settings.language,
    alwaysOnTop: settings.alwaysOnTop,
    positionFixed: settings.positionFixed,
  }).catch(() => {});
}
