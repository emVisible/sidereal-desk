import { useEffect } from "react";
import { TWILIGHT_ACCENTS, TWILIGHT_BG } from "./astronomy/skyState";
import { localeTag } from "./i18n/messages";
import { useSkyLoop } from "./hooks/useSkyLoop";
import { useAppStore } from "./store/useAppStore";
import { useBootstrap, useLocationOnboarding, useMinimalHint } from "./store/bootstrap";
import {
  EphemerisNote,
  InstrumentChrome,
  InstrumentFooter,
} from "./components/InstrumentChrome";
import { ClockLegend } from "./components/ClockLegend";
import { LocationOnboarding } from "./components/LocationOnboarding";
import { SettingsPanel } from "./components/SettingsPanel";
import { SiderealClock } from "./components/SiderealClock";
import { TimeStatus } from "./components/TimeStatus";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useI18n } from "./i18n/useI18n";
import { cycleDisplayMode } from "./utils/displayMode";
import { snapToNextCorner } from "./utils/windowBounds";
import { applyWindowLayout } from "./utils/windowLayout";
import "./styles/instrument.css";

export function App() {
  useBootstrap();

  const settings = useAppStore((s) => s.settings);
  const showSettings = useAppStore((s) => s.showSettings);
  const timeScrubbing = useAppStore((s) => s.timeScrubbing);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const setDisplayMode = useAppStore((s) => s.setDisplayMode);
  const resetTimeToNow = useAppStore((s) => s.resetTimeToNow);
  const scrubHours = useAppStore((s) => s.scrubHours);
  const setTimePaused = useAppStore((s) => s.setTimePaused);
  const timePaused = useAppStore((s) => s.timePaused);

  const sky = useSkyLoop();
  const showMinimalHint = useMinimalHint();
  const locationOnboarding = useLocationOnboarding();
  const { t } = useI18n();
  const { displayMode } = settings;
  const isMinimal = displayMode === "minimal";
  const isCompact = displayMode === "compact";

  useEffect(() => {
    applyWindowLayout(displayMode);
  }, [displayMode]);

  useEffect(() => {
    document.documentElement.lang = localeTag(settings.language);
  }, [settings.language]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") {
        if (showSettings) setShowSettings(false);
        else if (isMinimal) setDisplayMode("full");
        return;
      }
      if (e.key === "," || (e.key === "," && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setShowSettings(true);
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setTimePaused(!timePaused);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        resetTimeToNow();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrubHours(-0.25);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrubHours(0.25);
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setDisplayMode(cycleDisplayMode(displayMode));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    showSettings,
    setShowSettings,
    isMinimal,
    setDisplayMode,
    displayMode,
    setTimePaused,
    timePaused,
    resetTimeToNow,
    scrubHours,
  ]);

  const startBodyDrag = (e: React.MouseEvent) => {
    if (!isMinimal || e.button !== 0) return;
    if (settings.positionFixed) return;
    if ((e.target as HTMLElement).closest("button")) return;
    getCurrentWindow().startDragging().catch(() => {});
  };

  const twilightStyle = {
    "--accent": TWILIGHT_ACCENTS[sky.twilight],
    "--panel-bg": TWILIGHT_BG[sky.twilight],
  } as React.CSSProperties;

  const layoutClass =
    displayMode === "minimal"
      ? "instrument--minimal"
      : displayMode === "compact"
        ? "instrument--compact"
        : "";

  return (
    <div
      className={`instrument ${layoutClass} twilight--${sky.twilight} ${timeScrubbing ? "instrument--simulated" : ""} ${settings.positionFixed ? "instrument--fixed" : ""}`}
      style={twilightStyle}
    >
      {isMinimal && <div className="chrome-peek-zone" aria-hidden />}

      {showMinimalHint && (
        <div className="minimal-intro-toast" role="status">
          {t("minimalIntro")}
        </div>
      )}

      <InstrumentChrome
        displayMode={displayMode}
        onSettings={() => setShowSettings(true)}
        onCycleDisplay={() => {
          if (displayMode === "minimal") setDisplayMode("full");
          else setDisplayMode(cycleDisplayMode(displayMode));
        }}
        onSnapCorner={() => snapToNextCorner()}
        timeScrubbing={timeScrubbing}
        onResetTime={resetTimeToNow}
      />

      {!isMinimal && <TimeStatus />}

      <main className="instrument-body" onMouseDown={startBodyDrag}>
        <div className={`clock-plate ${timeScrubbing ? "clock-plate--simulated" : ""}`}>
          <SiderealClock
            sky={sky}
            showSeconds={settings.showSeconds}
            simulated={timeScrubbing}
            onScrub={scrubHours}
            onResetTime={resetTimeToNow}
          />
        </div>
        {isMinimal && settings.showLegend && <ClockLegend />}
        <EphemerisNote sky={sky} hidden={isCompact || isMinimal} />
      </main>

      {!isMinimal && <InstrumentFooter timeScrubbing={timeScrubbing} />}

      {showSettings && <SettingsPanel />}

      {locationOnboarding.show && (
        <LocationOnboarding
          onManual={locationOnboarding.openManual}
          onDone={locationOnboarding.dismiss}
        />
      )}
    </div>
  );
}
