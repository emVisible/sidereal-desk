import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchRiseSet,
  SiderealTime,
} from "astronomy-engine";
import type { ObserverLocation } from "../store/useAppStore";

export type TwilightPhase =
  | "day"
  | "civil"
  | "nautical"
  | "astronomical"
  | "night";

export interface SkyState {
  lstHours: number;
  gmstHours: number;
  /** Sun marker 0–1 on day ring */
  solarProgress: number;
  siderealProgress: number;
  sunAltitude: number;
  sunAzimuth: number;
  twilight: TwilightPhase;
  /** Illuminated fraction 0–1 */
  moonPhase: number;
  /** Phase angle degrees: 0=new, 180=full */
  moonPhaseAngle: number;
  moonIllumination: number;
  moonAgeDays: number;
  sunrise: Date | null;
  sunset: Date | null;
  daylightRemainingMin: number | null;
}

const cache = new Map<string, { day: string; sunrise: Date | null; sunset: Date | null }>();

function observer(loc: ObserverLocation) {
  return new Observer(loc.latitude, loc.longitude, loc.elevation);
}

function cacheKey(loc: ObserverLocation, date: Date) {
  return `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)},${date.toDateString()}`;
}

function twilightFromAltitude(alt: number): TwilightPhase {
  if (alt > 0) return "day";
  if (alt > -6) return "civil";
  if (alt > -12) return "nautical";
  if (alt > -18) return "astronomical";
  return "night";
}

function findSunEvent(
  loc: ObserverLocation,
  direction: number,
  after: Date,
): Date | null {
  try {
    const result = SearchRiseSet(Body.Sun, observer(loc), direction, after, 1);
    return result ? new Date(result.date) : null;
  } catch {
    return null;
  }
}

function getSunEvents(loc: ObserverLocation, date: Date) {
  const key = cacheKey(loc, date);
  const hit = cache.get(key);
  if (hit) return { sunrise: hit.sunrise, sunset: hit.sunset };

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const sunrise = findSunEvent(loc, +1, dayStart);
  const sunset = sunrise
    ? findSunEvent(loc, -1, new Date(sunrise.getTime() + 3_600_000))
    : findSunEvent(loc, -1, dayStart);

  cache.set(key, { day: date.toDateString(), sunrise, sunset });
  if (cache.size > 8) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  return { sunrise, sunset };
}

function clockFraction(date: Date): number {
  return (
    (date.getHours() * 3600 +
      date.getMinutes() * 60 +
      date.getSeconds()) /
    86_400
  );
}

function solarProgressOnDial(
  date: Date,
  sunrise: Date | null,
  sunset: Date | null,
): number {
  const now = date.getTime();
  // Sun marker follows local civil time on the 24h dial (0 = midnight at top).
  if (sunrise && sunset) {
    const rise = sunrise.getTime();
    const set = sunset.getTime();
    if (set > rise && now >= rise && now <= set) {
      const riseF = clockFraction(sunrise);
      const setF = clockFraction(sunset);
      const f = (now - rise) / (set - rise);
      return riseF + f * (setF - riseF);
    }
  }
  return clockFraction(date);
}

export function computeSkyState(
  loc: ObserverLocation,
  date = new Date(),
): SkyState {
  const obs = observer(loc);
  const gmst = SiderealTime(date);
  const lst = ((gmst + loc.longitude / 15) % 24 + 24) % 24;

  const sunEq = Equator(Body.Sun, date, obs, true, true);
  const sunHor = Horizon(date, obs, sunEq.ra, sunEq.dec, "normal");
  const twilight = twilightFromAltitude(sunHor.altitude);

  const moonIllum = Illumination(Body.Moon, date);
  const moonPhase = moonIllum.phase_fraction;
  const moonPhaseAngle = moonIllum.phase_angle;
  const moonAgeDays = (moonPhaseAngle / 360) * 29.530588853;

  const { sunrise, sunset } = getSunEvents(loc, date);

  let daylightRemainingMin: number | null = null;
  if (sunHor.altitude > 0 && sunset && sunset > date) {
    daylightRemainingMin = (sunset.getTime() - date.getTime()) / 60_000;
  }

  const solarProgress = solarProgressOnDial(date, sunrise, sunset);
  const siderealProgress = lst / 24;

  return {
    lstHours: lst,
    gmstHours: gmst,
    solarProgress,
    siderealProgress,
    sunAltitude: sunHor.altitude,
    sunAzimuth: sunHor.azimuth,
    twilight,
    moonPhase,
    moonPhaseAngle,
    moonIllumination: moonPhase,
    moonAgeDays,
    sunrise,
    sunset,
    daylightRemainingMin,
  };
}

export function formatLst(hours: number, showSeconds = true): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  if (!showSeconds) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Twilight accent colors for CSS variables */
export const TWILIGHT_ACCENTS: Record<TwilightPhase, string> = {
  day: "#c9a45c",
  civil: "#c07850",
  nautical: "#6a88a8",
  astronomical: "#4a5878",
  night: "#3a4868",
};

export const TWILIGHT_BG: Record<TwilightPhase, string> = {
  day: "rgba(14, 16, 26, 0.80)",
  civil: "rgba(24, 14, 18, 0.86)",
  nautical: "rgba(12, 16, 30, 0.88)",
  astronomical: "rgba(8, 10, 20, 0.90)",
  night: "rgba(6, 8, 16, 0.92)",
};
