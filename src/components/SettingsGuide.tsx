import type { MessageKey } from "../i18n/messages";
import { useI18n } from "../i18n/useI18n";

const GUIDE_SECTIONS: { title: MessageKey; items: MessageKey[] }[] = [
  {
    title: "displayMode",
    items: ["tipLayout"],
  },
  {
    title: "location",
    items: ["tipSyncLocation", "tipLatitude", "tipLongitude", "tipElevation"],
  },
  {
    title: "display",
    items: ["tipAlwaysOnTop", "tipPositionFixed", "tipShowSeconds", "tipShowLegend"],
  },
  {
    title: "timeSection",
    items: ["tipTimeSpeed", "tipTimePause", "tipTimeStep", "tipResetNow"],
  },
  {
    title: "howToRead",
    items: [
      "tipLstHand",
      "tipSunGold",
      "tipSunGray",
      "tipDaylightArc",
      "tipMoon",
      "tipTwilight",
    ],
  },
];

interface Props {
  onBack: () => void;
}

export function SettingsGuide({ onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="settings-guide">
      <header className="settings-header">
        <h2>{t("guideTitle")}</h2>
        <button type="button" className="settings-guide-back" onClick={onBack}>
          {t("guideBack")}
        </button>
      </header>

      <div className="settings-body settings-guide-body">
        {GUIDE_SECTIONS.map((section) => (
          <section key={section.title} className="settings-section settings-section--guide">
            <h3>{t(section.title)}</h3>
            <ul className="guide-list">
              {section.items.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
