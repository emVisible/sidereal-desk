import { create } from "zustand";
import { simulationClock } from "../core/SimulationClock";
import { saveLocation, saveSettings } from "./persistence";
import type { Locale } from "../i18n/messages";

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation: number;
}

export type DisplayMode = "full" | "compact" | "minimal";

export interface AppSettings {
  language: Locale;
  alwaysOnTop: boolean;
  positionFixed: boolean;
  showSeconds: boolean;
  showLegend: boolean;
  displayMode: DisplayMode;
  preferredTimeSpeed: number;
  dialScale: number;
}

interface AppState {
  location: ObserverLocation;
  settings: AppSettings;
  timeEpochMs: number;
  timeSpeed: number;
  timePaused: boolean;
  timeScrubbing: boolean;
  showSettings: boolean;

  setLocation: (patch: Partial<ObserverLocation>, persist?: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setShowSettings: (show: boolean) => void;
  setTimeSpeed: (speed: number) => void;
  setTimePaused: (paused: boolean) => void;
  scrubHours: (deltaHours: number) => void;
  resetTimeToNow: () => void;
  syncClock: () => void;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  alwaysOnTop: true,
  positionFixed: false,
  showSeconds: true,
  showLegend: false,
  displayMode: "full",
  preferredTimeSpeed: 1,
  dialScale: 1,
};

const SCRUB_THRESHOLD_MS = 5_000;

function applyClock(s: Pick<AppState, "timeEpochMs" | "timeSpeed" | "timePaused">) {
  simulationClock.sync({
    epochMs: s.timeEpochMs,
    speed: s.timeSpeed,
    paused: s.timePaused,
  });
}

function isScrubbing(epochMs: number) {
  return Math.abs(epochMs - Date.now()) > SCRUB_THRESHOLD_MS;
}

export const useAppStore = create<AppState>((set, get) => {
  const now = Date.now();
  simulationClock.sync({ epochMs: now, speed: 1, paused: false });

  return {
    location: { latitude: 39.9042, longitude: 116.4074, elevation: 50 },
    settings: DEFAULT_SETTINGS,
    timeEpochMs: now,
    timeSpeed: 1,
    timePaused: false,
    timeScrubbing: false,
    showSettings: false,

    setLocation: (patch, persist = true) =>
      set((s) => {
        const location = { ...s.location, ...patch };
        if (persist) saveLocation(location);
        return { location };
      }),

    updateSettings: (patch) =>
      set((s) => {
        const settings = { ...s.settings, ...patch };
        saveSettings(settings);
        return { settings };
      }),

    setDisplayMode: (displayMode) => {
      get().updateSettings({ displayMode });
    },

    setShowSettings: (showSettings) => set({ showSettings }),

    setTimeSpeed: (timeSpeed) => {
      set({ timeSpeed });
      simulationClock.setSpeed(timeSpeed);
      if (!get().timeScrubbing) {
        const settings = { ...get().settings, preferredTimeSpeed: timeSpeed };
        set({ settings });
        saveSettings(settings);
      }
    },

    setTimePaused: (timePaused) => {
      set({ timePaused });
      simulationClock.setPaused(timePaused);
    },

    scrubHours: (deltaHours) => {
      const ms = deltaHours * 3_600_000;
      const epochMs = get().timeEpochMs + ms;
      const { timeSpeed, timePaused } = get();
      set({
        timeEpochMs: epochMs,
        timeScrubbing: isScrubbing(epochMs),
      });
      simulationClock.sync({ epochMs, speed: timeSpeed, paused: timePaused });
    },

    resetTimeToNow: () => {
      const t = Date.now();
      const speed = get().settings.preferredTimeSpeed;
      set({
        timeEpochMs: t,
        timePaused: false,
        timeSpeed: speed,
        timeScrubbing: false,
      });
      simulationClock.sync({ epochMs: t, speed, paused: false });
    },

    syncClock: () => applyClock(get()),
  };
});
