import { useI18n } from "../i18n/useI18n";

export function ClockLegend() {
  const { t } = useI18n();

  return (
    <div className="clock-legend">
      <span className="legend-item legend-item--lst">{t("legendLst")}</span>
      <span className="legend-item legend-item--sun">{t("legendSun")}</span>
      <span className="legend-item legend-item--sun-night">{t("legendSunNight")}</span>
      <span className="legend-item legend-item--arc">{t("legendDaylight")}</span>
    </div>
  );
}
