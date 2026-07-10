import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Locale } from "../i18n/messages";
import { useI18n } from "../i18n/useI18n";
import { TIME_SPEED_PRESETS } from "../core/SimulationClock";
import { useAppStore, type DisplayMode } from "../store/useAppStore";
import { SettingsGuide } from "./SettingsGuide";
import { syncTrayMenu } from "../store/traySync";
import type { LocationSource } from "../utils/locationSync";
import { LocationSyncError, syncCurrentLocation } from "../utils/locationSync";

const DISPLAY_MODES: DisplayMode[] = ["full", "compact", "minimal"];

const MODE_LABEL: Record<DisplayMode, "displayFull" | "displayCompact" | "displayMinimal"> = {
  full: "displayFull",
  compact: "displayCompact",
  minimal: "displayMinimal",
};

export function SettingsPanel() {
  const show = useAppStore((s) => s.showSettings);
  const setShow = useAppStore((s) => s.setShowSettings);
  const location = useAppStore((s) => s.location);
  const settings = useAppStore((s) => s.settings);
  const timePaused = useAppStore((s) => s.timePaused);
  const timeSpeed = useAppStore((s) => s.timeSpeed);
  const setLocation = useAppStore((s) => s.setLocation);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const setDisplayMode = useAppStore((s) => s.setDisplayMode);
  const setTimeSpeed = useAppStore((s) => s.setTimeSpeed);
  const setTimePaused = useAppStore((s) => s.setTimePaused);
  const scrubHours = useAppStore((s) => s.scrubHours);
  const resetTimeToNow = useAppStore((s) => s.resetTimeToNow);
  const { t } = useI18n();
  const [showGuide, setShowGuide] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  if (!show) return null;

  const persistLocation = (patch: Partial<typeof location>) => {
    const merged = { ...location, ...patch };
    const lat = merged.latitude;
    const lon = merged.longitude;
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;
    setLocation(patch);
    invoke("set_location", {
      latitude: lat,
      longitude: lon,
      elevation: merged.elevation,
    }).catch(console.warn);
  };

  const patchSettings = (patch: Partial<typeof settings>) => {
    updateSettings(patch);
    const next = { ...settings, ...patch };
    syncTrayMenu(next);
  };

  const setLanguage = (language: Locale) => patchSettings({ language });

  const handleSyncLocation = async () => {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const source: LocationSource = await syncCurrentLocation(true);
      setSyncMsg(source === "gps" ? t("syncLocationGps") : t("syncLocationIp"));
    } catch (e) {
      setSyncMsg(
        e instanceof LocationSyncError ? t("syncLocationFail") : t("syncLocationFail"),
      );
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="settings-backdrop" onClick={() => setShow(false)}>
      <div className="settings-sheet" onClick={(e) => e.stopPropagation()}>
        {showGuide ? (
          <SettingsGuide onBack={() => setShowGuide(false)} />
        ) : (
          <>
            <header className="settings-header">
              <h2>{t("settings")}</h2>
              <button
                type="button"
                className="settings-guide-btn"
                onClick={() => setShowGuide(true)}
              >
                {t("guide")}
              </button>
            </header>

            <div className="settings-body">
              <section className="settings-section">
                <h3>{t("language")}</h3>
                <p className="field-tip">{t("tipLanguage")}</p>
                <div className="lang-toggle" role="group" aria-label={t("language")}>
                  <button
                    type="button"
                    className={`lang-btn ${settings.language === "en" ? "lang-btn--active" : ""}`}
                    onClick={() => setLanguage("en")}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`lang-btn ${settings.language === "zh" ? "lang-btn--active" : ""}`}
                    onClick={() => setLanguage("zh")}
                  >
                    中文
                  </button>
                </div>
              </section>

              <section className="settings-section">
                <h3>{t("displayMode")}</h3>
                <p className="field-tip">{t("tipLayout")}</p>
                <div className="lang-toggle" role="group" aria-label={t("displayMode")}>
                  {DISPLAY_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`lang-btn ${settings.displayMode === mode ? "lang-btn--active" : ""}`}
                      onClick={() => setDisplayMode(mode)}
                    >
                      {t(MODE_LABEL[mode])}
                    </button>
                  ))}
                </div>
              </section>

              <section className="settings-section">
                <h3>{t("location")}</h3>
                <p className="field-tip">{t("syncLocationTip")}</p>
                <button
                  type="button"
                  className="settings-inline-btn settings-sync-btn"
                  onClick={handleSyncLocation}
                  disabled={syncBusy}
                >
                  {syncBusy ? t("syncLocationBusy") : t("syncLocation")}
                </button>
                {syncMsg && <p className="field-tip field-tip--status">{syncMsg}</p>}
                <label className="settings-field">
                  <span className="field-label">{t("latitude")}</span>
                  <span className="field-tip">{t("tipLatitude")}</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={location.latitude}
                    onChange={(e) =>
                      persistLocation({ latitude: parseFloat(e.target.value) })
                    }
                  />
                </label>
                <label className="settings-field">
                  <span className="field-label">{t("longitude")}</span>
                  <span className="field-tip">{t("tipLongitude")}</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={location.longitude}
                    onChange={(e) =>
                      persistLocation({ longitude: parseFloat(e.target.value) })
                    }
                  />
                </label>
                <label className="settings-field">
                  <span className="field-label">{t("elevation")}</span>
                  <span className="field-tip">{t("tipElevation")}</span>
                  <input
                    type="number"
                    step="1"
                    value={location.elevation}
                    onChange={(e) =>
                      persistLocation({ elevation: parseFloat(e.target.value) })
                    }
                  />
                </label>
              </section>

              <section className="settings-section">
                <h3>{t("display")}</h3>
                <div className="check-list">
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={settings.alwaysOnTop}
                      onChange={(e) =>
                        patchSettings({ alwaysOnTop: e.target.checked })
                      }
                    />
                    <span className="check-label">
                      {t("alwaysOnTop")}
                      <span className="check-tip">{t("tipAlwaysOnTop")}</span>
                    </span>
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={settings.positionFixed}
                      onChange={(e) =>
                        patchSettings({ positionFixed: e.target.checked })
                      }
                    />
                    <span className="check-label">
                      {t("positionFixed")}
                      <span className="check-tip">{t("tipPositionFixed")}</span>
                    </span>
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={settings.showSeconds}
                      onChange={(e) =>
                        updateSettings({ showSeconds: e.target.checked })
                      }
                    />
                    <span className="check-label">
                      {t("showSeconds")}
                      <span className="check-tip">{t("tipShowSeconds")}</span>
                    </span>
                  </label>
                  {settings.displayMode === "minimal" && (
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={settings.showLegend}
                        onChange={(e) =>
                          updateSettings({ showLegend: e.target.checked })
                        }
                      />
                      <span className="check-label">
                        {t("showLegend")}
                        <span className="check-tip">{t("tipShowLegend")}</span>
                      </span>
                    </label>
                  )}
                </div>
                <label className="settings-field">
                  <span className="field-label">{t("dialScale") || "Dial Scale"}</span>
                  <span className="field-tip">{t("tipDialScale") || "Adjust the size of the sidereal dial"}</span>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.1"
                      value={settings.dialScale}
                      onChange={(e) => patchSettings({ dialScale: parseFloat(e.target.value) })}
                      className="dial-scale-slider"
                    />
                    <span className="slider-value">{(settings.dialScale * 100).toFixed(0)}%</span>
                  </div>
                </label>
              </section>

              <section className="settings-section">
                <h3>{t("timeSection")}</h3>
                <p className="field-tip">{t("tipTimeSpeed")}</p>
                <div className="time-speed-row">
                  {TIME_SPEED_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`lang-btn ${timeSpeed === p.value ? "lang-btn--active" : ""}`}
                      onClick={() => setTimeSpeed(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="settings-inline-btn"
                  onClick={() => setTimePaused(!timePaused)}
                >
                  {timePaused ? t("timeResume") : t("timePause")}
                </button>
                <div className="time-step-row">
                  <button type="button" className="settings-inline-btn" onClick={() => scrubHours(-1)}>
                    {t("timeStepBack60")}
                  </button>
                  <button type="button" className="settings-inline-btn" onClick={() => scrubHours(-0.25)}>
                    {t("timeStepBack15")}
                  </button>
                  <button type="button" className="settings-inline-btn" onClick={() => scrubHours(0.25)}>
                    {t("timeStepFwd15")}
                  </button>
                  <button type="button" className="settings-inline-btn" onClick={() => scrubHours(1)}>
                    {t("timeStepFwd60")}
                  </button>
                </div>
                <button type="button" className="settings-inline-btn" onClick={resetTimeToNow}>
                  {t("resetNow")}
                </button>
              </section>
            </div>

            <footer className="settings-footer">
              <button className="settings-close" onClick={() => setShow(false)}>
                {t("close")}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
