import { useMemo } from "react";
import type { SkyState, TwilightPhase } from "../astronomy/skyState";
import { useAppStore } from "../store/useAppStore";
import { formatMessage, t, type Locale, type MessageKey } from "./messages";

export function useI18n() {
  const locale = useAppStore((s) => s.settings.language);

  return useMemo(
    () => ({
      locale,
      t: (key: MessageKey) => t(locale, key),
      tf: (key: MessageKey, vars: Record<string, string | number>) =>
        formatMessage(locale, key, vars),
      timeLocale: locale === "zh" ? "zh-CN" : "en-US",
    }),
    [locale],
  );
}

export function twilightKey(phase: TwilightPhase): MessageKey {
  const map = {
    day: "twilightDay",
    civil: "twilightCivil",
    nautical: "twilightNautical",
    astronomical: "twilightAstronomical",
    night: "twilightNight",
  } as const;
  return map[phase];
}

export function phaseKey(angle: number): MessageKey {
  const a = ((angle % 360) + 360) % 360;
  if (a < 15 || a > 345) return "phaseNew";
  if (a < 90) return "phaseCrescent";
  if (a < 180) return "phaseWaxing";
  if (a < 195) return "phaseFull";
  if (a < 270) return "phaseWaning";
  return "phaseLast";
}

export function skyNote(sky: SkyState, locale: Locale): string {
  const lst = sky.lstHours.toFixed(2);
  if (sky.twilight === "day") {
    if (sky.daylightRemainingMin != null) {
      return formatMessage(locale, "noteDayRemain", {
        min: Math.round(sky.daylightRemainingMin),
      });
    }
    return t(locale, "noteDay");
  }
  if (sky.twilight === "civil") return t(locale, "noteCivil");
  if (sky.twilight === "nautical") return t(locale, "noteNautical");
  if (sky.twilight === "astronomical") return t(locale, "noteAstronomical");
  return formatMessage(locale, "noteNight", { lst });
}
