import { useMemo } from "react";
import type { SkyState } from "../astronomy/skyState";
import { formatLst } from "../astronomy/skyState";
import { simulationClock } from "../core/SimulationClock";
import { useI18n } from "../i18n/useI18n";

const SIZE = 280;
const CX = 140;
const CY = 140;
const R_OUTER = 128;
const R_SUN = 108;
const R_TWILIGHT = 96;
const R_SIDEREAL = 78;

function polar(cx: number, cy: number, r: number, t: number) {
  const a = t * Math.PI * 2 - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, t0: number, t1: number) {
  const p0 = polar(cx, cy, r, t0);
  const p1 = polar(cx, cy, r, t1);
  const large = t1 - t0 > 0.5 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

interface Props {
  sky: SkyState;
  showSeconds: boolean;
  scale?: number;
  simulated?: boolean;
  onScrub?: (deltaHours: number) => void;
  onResetTime?: () => void;
}

const HOUR_LABELS = [
  { t: 0, label: "0" },
  { t: 0.25, label: "6" },
  { t: 0.5, label: "12" },
  { t: 0.75, label: "18" },
];

export function SiderealClock({
  sky,
  showSeconds,
  scale = 1,
  simulated = false,
  onScrub,
  onResetTime,
}: Props) {
  const { timeLocale, t } = useI18n();

  const civilDisplay = useMemo(
    () =>
      simulationClock.getDate().toLocaleTimeString(timeLocale, {
        hour: "2-digit",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined,
        hour12: false,
      }),
    [timeLocale, showSeconds, sky.lstHours],
  );

  const handEnd = useMemo(
    () => polar(CX, CY, R_SIDEREAL - 8, sky.siderealProgress),
    [sky.siderealProgress],
  );
  const sunPos = useMemo(
    () => polar(CX, CY, R_SUN, sky.solarProgress),
    [sky.solarProgress],
  );

  const daylightArc = useMemo(() => {
    if (!sky.sunrise || !sky.sunset) return null;
    const rise =
      (sky.sunrise.getHours() * 3600 +
        sky.sunrise.getMinutes() * 60 +
        sky.sunrise.getSeconds()) /
      86_400;
    const set =
      (sky.sunset.getHours() * 3600 +
        sky.sunset.getMinutes() * 60 +
        sky.sunset.getSeconds()) /
      86_400;
    if (set <= rise) return null;
    return arcPath(CX, CY, R_TWILIGHT, rise, set);
  }, [sky.sunrise, sky.sunset]);

  const lstDisplay = formatLst(sky.lstHours, showSeconds);
  const sunUp = sky.sunAltitude > -12;
  const sunDay = sky.sunAltitude > 0;

  const handleWheel = (e: React.WheelEvent) => {
    if (!onScrub) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    onScrub(delta);
  };

  const handleDoubleClick = () => {
    onResetTime?.();
  };

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={`sidereal-clock ${simulated ? "sidereal-clock--simulated" : ""}`}
      style={{ transform: `scale(${scale})`, transformOrigin: "center", display: "block" }}
      role="img"
      aria-label={t("clockAria")}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0a0e18" stopOpacity="0" />
        </radialGradient>
        <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hour ticks */}
      {Array.from({ length: 24 }, (_, i) => {
        const t = i / 24;
        const p0 = polar(CX, CY, R_OUTER - 6, t);
        const p1 = polar(CX, CY, R_OUTER - (i % 6 === 0 ? 14 : 10), t);
        return (
          <line
            key={i}
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke={i % 6 === 0 ? "rgba(200,170,120,0.35)" : "rgba(200,170,120,0.12)"}
            strokeWidth={i % 6 === 0 ? 1.2 : 0.6}
          />
        );
      })}

      {HOUR_LABELS.map(({ t: frac, label }) => {
        const p = polar(CX, CY, R_OUTER - 20, frac);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="clock-hour-label"
          >
            {label}
          </text>
        );
      })}

      <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#skyGlow)" />
      <circle
        cx={CX}
        cy={CY}
        r={R_OUTER}
        fill="none"
        stroke="rgba(200,170,120,0.14)"
        strokeWidth="1"
      />

      {/* Sidereal ring */}
      <circle
        cx={CX}
        cy={CY}
        r={R_SIDEREAL}
        fill="none"
        stroke="rgba(130,165,200,0.25)"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* Solar ring */}
      <circle
        cx={CX}
        cy={CY}
        r={R_SUN}
        fill="none"
        stroke="rgba(200,170,120,0.12)"
        strokeWidth="1"
      />
      {daylightArc && (
        <path
          d={daylightArc}
          fill="none"
          stroke="rgba(220,180,100,0.5)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="daylight-arc"
        />
      )}

      {/* Sidereal hand */}
      <line
        x1={CX}
        y1={CY}
        x2={handEnd.x}
        y2={handEnd.y}
        stroke="rgba(150,190,220,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="sidereal-hand"
      />
      <circle cx={handEnd.x} cy={handEnd.y} r="2.5" fill="rgba(180,210,240,0.9)" />

      {/* Sun marker — gold when up, gray when below nautical twilight */}
      <g filter={sunUp ? "url(#sunGlow)" : undefined}>
        <circle
          cx={sunPos.x}
          cy={sunPos.y}
          r="6"
          fill={sunDay ? "var(--accent)" : sunUp ? "var(--accent)" : "rgba(130, 138, 150, 0.8)"}
          opacity={sunDay ? 0.95 : sunUp ? 0.65 : 0.9}
        />
        {sunUp && (
          <circle cx={sunPos.x} cy={sunPos.y} r="10" fill="var(--accent)" opacity="0.12" />
        )}
      </g>

      {/* Moon — offset below readout to avoid text overlap */}
      <MoonDisc
        cx={CX}
        cy={CY + 34}
        r={13}
        phaseAngle={sky.moonPhaseAngle}
        illumination={sky.moonPhase}
      />

      {/* Center readout */}
      <text x={CX} y={CY - 12} textAnchor="middle" className="clock-lst">
        {lstDisplay}
      </text>
      <text x={CX} y={CY + 2} textAnchor="middle" className="clock-label">
        {t("lstLabel")}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" className="clock-civil">
        ☉ {civilDisplay}
      </text>
    </svg>
  );
}

function MoonDisc({
  cx,
  cy,
  r,
  phaseAngle,
  illumination,
}: {
  cx: number;
  cy: number;
  r: number;
  phaseAngle: number;
  illumination: number;
}) {
  const waxing = phaseAngle <= 180;
  const k = Math.abs(Math.cos((phaseAngle * Math.PI) / 180));
  const shadowRx = Math.max(0.5, r * (1 - k * 0.92));
  const shadowCx = cx + (waxing ? -r * 0.35 * (1 - k) : r * 0.35 * (1 - k));

  if (illumination < 0.02) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgba(160,170,190,0.08)"
        stroke="rgba(180,190,210,0.25)"
        strokeWidth="0.6"
      />
    );
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(210,218,235,0.45)" />
      <ellipse
        cx={shadowCx}
        cy={cy}
        rx={shadowRx}
        ry={r}
        fill="rgba(8,10,18,0.9)"
      />
    </g>
  );
}
