import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { migrateSettings } from "../utils/displayMode";
import { syncTrayMenu } from "./traySync";
import {
  loadHintFlag,
  loadPersistedLocation,
  loadPersistedSettings,
  loadWindowBounds,
  saveHintFlag,
  saveWindowBounds,
} from "./persistence";
import { DEFAULT_SETTINGS, useAppStore, type ObserverLocation } from "./useAppStore";
import { readWindowBounds, restoreWindowBounds } from "../utils/windowBounds";
import { applyWindowLayout } from "../utils/windowLayout";

export function useBootstrap() {
  const setShowSettings = useAppStore((s) => s.setShowSettings);

  useEffect(() => {
    Promise.all([loadPersistedSettings(), loadPersistedLocation()]).then(
      ([savedSettings, savedLocation]) => {
        if (savedSettings) {
          const migrated = migrateSettings(savedSettings);
          const settings = { ...DEFAULT_SETTINGS, ...migrated };
          useAppStore.setState({ settings });
          useAppStore.getState().setTimeSpeed(settings.preferredTimeSpeed);
          applyWindowLayout(settings.displayMode);
          syncTrayMenu(settings);
          getCurrentWindow().setAlwaysOnTop(settings.alwaysOnTop).catch(() => {});
        }

        if (savedLocation) {
          useAppStore.getState().setLocation(savedLocation, false);
          invoke("set_location", {
            latitude: savedLocation.latitude,
            longitude: savedLocation.longitude,
            elevation: savedLocation.elevation,
          }).catch(() => {});
        } else {
          invoke<ObserverLocation>("get_location")
            .then((loc) => {
              if (loc) useAppStore.getState().setLocation(loc, false);
            })
            .catch(() => {});
        }
      },
    );

    loadWindowBounds().then((bounds) => restoreWindowBounds(bounds));

    const win = getCurrentWindow();
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        readWindowBounds().then((b) => {
          if (b) saveWindowBounds(b);
        });
      }, 400);
    };

    const unlistenTop = useAppStore.subscribe((state, prev) => {
      if (state.settings.alwaysOnTop !== prev.settings.alwaysOnTop) {
        win.setAlwaysOnTop(state.settings.alwaysOnTop).catch(() => {});
        syncTrayMenu(state.settings);
      }
      if (state.settings.positionFixed !== prev.settings.positionFixed) {
        syncTrayMenu(state.settings);
      }
      if (state.settings.language !== prev.settings.language) {
        syncTrayMenu(state.settings);
      }
    });

    const unlistenTray = listen("open-settings", () => setShowSettings(true));
    const unlistenTrayTop = listen<boolean>("tray-always-on-top", (e) => {
      const checked = e.payload;
      const { settings } = useAppStore.getState();
      if (settings.alwaysOnTop !== checked) {
        useAppStore.getState().updateSettings({ alwaysOnTop: checked });
      }
      win.setAlwaysOnTop(checked).catch(() => {});
    });
    const unlistenTrayFix = listen<boolean>("tray-fix-position", (e) => {
      const checked = e.payload;
      const { settings } = useAppStore.getState();
      if (settings.positionFixed !== checked) {
        useAppStore.getState().updateSettings({ positionFixed: checked });
      }
    });
    const unlistenMove = win.onMoved(() => {
      if (useAppStore.getState().settings.positionFixed) return;
      scheduleSave();
    });

    return () => {
      unlistenTop();
      unlistenTray.then((fn) => fn());
      unlistenTrayTop.then((fn) => fn());
      unlistenTrayFix.then((fn) => fn());
      unlistenMove.then((fn) => fn());
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [setShowSettings]);
}

export function useMinimalHint() {
  const displayMode = useAppStore((s) => s.settings.displayMode);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (displayMode !== "minimal") {
      setShow(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    loadHintFlag("minimal-intro").then((shown) => {
      if (!shown) {
        setShow(true);
        timer = setTimeout(() => {
          setShow(false);
          saveHintFlag("minimal-intro", true);
        }, 3000);
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayMode]);

  return show;
}

export function useLocationOnboarding() {
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadPersistedLocation(), loadHintFlag("location-onboarding")]).then(
      ([saved, dismissed]) => {
        setReady(true);
        if (!saved && !dismissed) setShow(true);
      },
    );
  }, []);

  const dismiss = () => {
    saveHintFlag("location-onboarding", true);
    setShow(false);
  };

  const openManual = () => {
    dismiss();
    setShowSettings(true);
  };

  return { show: ready && show, dismiss, openManual };
}
