import { simulationClock } from "../core/SimulationClock";
import { useI18n } from "../i18n/useI18n";
import { useAppStore } from "../store/useAppStore";
import { formatSimDate, formatTimeOffset } from "../utils/timeOffset";

export function TimeStatus() {
  const timeScrubbing = useAppStore((s) => s.timeScrubbing);
  const displayMode = useAppStore((s) => s.settings.displayMode);
  const { t, timeLocale } = useI18n();

  if (!timeScrubbing) return null;

  const epoch = simulationClock.getDate().getTime();

  return (
    <div className={`time-status ${displayMode === "minimal" ? "time-status--minimal" : ""}`}>
      <span className="time-status-offset">
        {t("timeOffset")} {formatTimeOffset(epoch)}
      </span>
      <span className="time-status-date">
        {t("timeSimDate")} {formatSimDate(epoch, timeLocale)}
      </span>
    </div>
  );
}
