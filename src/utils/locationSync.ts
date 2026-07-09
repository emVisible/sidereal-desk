import { invoke } from "@tauri-apps/api/core";
import type { ObserverLocation } from "../store/useAppStore";
import { useAppStore } from "../store/useAppStore";

export type LocationSource = "gps" | "ip";

export class LocationSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocationSyncError";
  }
}

function readGps(): Promise<ObserverLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new LocationSyncError("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          elevation: pos.coords.altitude ?? 0,
        });
      },
      (err) => reject(new LocationSyncError(err.message)),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 120_000 },
    );
  });
}

async function readIp(): Promise<ObserverLocation> {
  return invoke<ObserverLocation>("fetch_location_from_ip");
}

/** GPS first, then HTTPS IP estimate. */
export async function resolveCurrentLocation(): Promise<{
  loc: ObserverLocation;
  source: LocationSource;
}> {
  try {
    const loc = await readGps();
    return { loc, source: "gps" };
  } catch {
    try {
      const loc = await readIp();
      return { loc, source: "ip" };
    } catch {
      throw new LocationSyncError("Could not determine location");
    }
  }
}

export async function applyLocation(loc: ObserverLocation, persist = true) {
  useAppStore.getState().setLocation(loc, persist);
  await invoke("set_location", {
    latitude: loc.latitude,
    longitude: loc.longitude,
    elevation: loc.elevation,
  });
}

export async function syncCurrentLocation(persist = true): Promise<LocationSource> {
  const { loc, source } = await resolveCurrentLocation();
  await applyLocation(loc, persist);
  return source;
}
