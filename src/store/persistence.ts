import type { AppSettings, ObserverLocation } from "./useAppStore";
import type { SavedWindowBounds } from "../utils/windowBounds";

const SETTINGS_KEY = "sidereal-desk-settings.json";

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load(SETTINGS_KEY, { autoSave: true, defaults: {} });
}

export async function loadPersistedSettings(): Promise<Partial<AppSettings> | null> {
  try {
    const store = await getStore();
    return (await store.get<Partial<AppSettings>>("settings")) ?? null;
  } catch {
    return null;
  }
}

export async function loadPersistedLocation(): Promise<ObserverLocation | null> {
  try {
    const store = await getStore();
    return (await store.get<ObserverLocation>("location")) ?? null;
  } catch {
    return null;
  }
}

export async function loadWindowBounds(): Promise<SavedWindowBounds | null> {
  try {
    const store = await getStore();
    return (await store.get<SavedWindowBounds>("windowBounds")) ?? null;
  } catch {
    return null;
  }
}

export async function loadHintFlag(key: string): Promise<boolean> {
  try {
    const store = await getStore();
    return (await store.get<boolean>(`hint:${key}`)) ?? false;
  } catch {
    return false;
  }
}

export async function saveSettings(settings: AppSettings) {
  try {
    const store = await getStore();
    await store.set("settings", settings);
    await store.save();
  } catch {
    /* web preview */
  }
}

export async function saveLocation(location: ObserverLocation) {
  try {
    const store = await getStore();
    await store.set("location", location);
    await store.save();
  } catch {
    /* web preview */
  }
}

export async function saveWindowBounds(bounds: SavedWindowBounds) {
  try {
    const store = await getStore();
    await store.set("windowBounds", bounds);
    await store.save();
  } catch {
    /* web preview */
  }
}

export async function saveHintFlag(key: string, shown: boolean) {
  try {
    const store = await getStore();
    await store.set(`hint:${key}`, shown);
    await store.save();
  } catch {
    /* web preview */
  }
}
