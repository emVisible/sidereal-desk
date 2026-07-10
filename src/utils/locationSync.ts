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
    // Check if navigator.geolocation is available (may not be in Tauri)
    if (!navigator.geolocation) {
      reject(new LocationSyncError("Geolocation API unavailable"));
      return;
    }

    // Set a reasonable timeout to avoid blocking too long
    const timeout = setTimeout(() => {
      reject(new LocationSyncError("GPS request timed out"));
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          elevation: pos.coords.altitude ?? 0,
        });
      },
      (err) => {
        clearTimeout(timeout);
        reject(new LocationSyncError(err.message));
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 0 },
    );
  });
}

async function readIp(): Promise<ObserverLocation> {
  try {
    const result = await invoke<ObserverLocation>("fetch_location_from_ip");
    if (!result || typeof result.latitude !== "number" || typeof result.longitude !== "number") {
      throw new LocationSyncError("Invalid location data from IP API");
    }
    return result;
  } catch (error) {
    const message = error instanceof LocationSyncError ? error.message : "IP geolocation failed";
    throw new LocationSyncError(message);
  }
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
