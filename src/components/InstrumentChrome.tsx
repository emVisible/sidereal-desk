import { getCurrentWindow } from "@tauri-apps/api/window";
import type { SkyState } from "../astronomy/skyState";
import { phaseKey, skyNote, twilightKey, useI18n } from "../i18n/useI18n";
import { useAppStore, type DisplayMode } from "../store/useAppStore";

interface NoteProps {
  sky: SkyState;
  hidden: boolean;
}

export function EphemerisNote({ sky, hidden }: NoteProps) {
  const { t, locale, timeLocale } = useI18n();

  if (hidden) return null;

  const fmt = (d: Date) =>
    d.toLocaleTimeString(timeLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="ephemeris-note">
      <div className="ephemeris-phase">
        <span className="phase-title">{t(twilightKey(sky.twilight))}</span>
      </div>

      <div className="ephemeris-chips">
        <span className="chip">☀ {sky.sunAltitude.toFixed(1)}°</span>
        <span className="chip">☽ {Math.round(sky.moonIllumination * 100)}%</span>
        <span className="chip">{t(phaseKey(sky.moonPhaseAngle))}</span>
        {sky.sunrise && <span className="chip">↑ {fmt(sky.sunrise)}</span>}
        {sky.sunset && <span className="chip">↓ {fmt(sky.sunset)}</span>}
      </div>

      <p className="note-body">{skyNote(sky, locale)}</p>
      <p className="note-hint">{t("hintNote")}</p>
    </div>
  );
}

interface ChromeProps {
  displayMode: DisplayMode;
  onSettings: () => void;
  onCycleDisplay: () => void;
  onSnapCorner: () => void;
  timeScrubbing: boolean;
  onResetTime: () => void;
}

export function InstrumentChrome({
  displayMode,
  onSettings,
  onCycleDisplay,
  onSnapCorner,
  timeScrubbing,
  onResetTime,
}: ChromeProps) {
  const { t } = useI18n();
  const positionFixed = useAppStore((s) => s.settings.positionFixed);
  const isMinimal = displayMode === "minimal";

  const startDrag = (e: React.MouseEvent) => {
    if (positionFixed) return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    getCurrentWindow().startDragging().catch(() => {});
  };

  const modeTitle =
    displayMode === "full"
      ? t("displayFull")
      : displayMode === "compact"
        ? t("displayCompact")
        : t("displayMinimal");

  return (
    <header
      className={`instrument-chrome ${isMinimal ? "instrument-chrome--peek" : ""}`}
      onMouseDown={startDrag}
    >
      {!isMinimal ? (
        <div className="chrome-brand">
          <span className="brand-mark">✦</span>
          <div>
            <span className="brand-title">Sidereal Desk</span>
            <span className="brand-sub">{t("brandSub")}</span>
          </div>
        </div>
      ) : (
        <span className="chrome-peek-label">{t("minimalPeek")}</span>
      )}

      <div className="chrome-actions">
        {timeScrubbing && (
          <button
            className="icon-btn icon-btn--active"
            onClick={onResetTime}
            title={t("resetNow")}
            aria-label={t("resetNow")}
          >
            ⟲
          </button>
        )}
        <button
          className="icon-btn"
          onClick={onSnapCorner}
          title={t("snapCorner")}
          aria-label={t("snapCorner")}
        >
          ⊡
        </button>
        {!isMinimal && (
          <button
            className="icon-btn"
            onClick={onCycleDisplay}
            title={modeTitle}
            aria-label={modeTitle}
          >
            {displayMode === "full" ? "▢" : displayMode === "compact" ? "○" : "▣"}
          </button>
        )}
        {isMinimal && (
          <button
            className="icon-btn icon-btn--active"
            onClick={() => onCycleDisplay()}
            title={t("exitMinimal")}
            aria-label={t("exitMinimal")}
          >
            ◉
          </button>
        )}
        <button
          className="icon-btn"
          onClick={onSettings}
          title={t("settings")}
          aria-label={t("settings")}
        >
          ⚙
        </button>
      </div>
    </header>
  );
}

interface FooterProps {
  timeScrubbing: boolean;
}

export function InstrumentFooter({ timeScrubbing }: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="instrument-footer">
      <span className="footer-hint">
        {timeScrubbing ? t("hintScrubbing") : t("hintScroll")}
      </span>
    </footer>
  );
}
