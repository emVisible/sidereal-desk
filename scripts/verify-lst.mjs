#!/usr/bin/env node
/**
 * Quick LST sanity check using astronomy-engine.
 * Compare output with Stellarium (same lat/lon, same UTC) — expect < 1 min error.
 *
 * Usage: node scripts/verify-lst.mjs [latitude] [longitude] [ISO-UTC]
 */
import { SiderealTime } from "astronomy-engine";

const lat = Number(process.argv[2] ?? 39.9042);
const lon = Number(process.argv[3] ?? 116.4074);
const when = process.argv[4] ? new Date(process.argv[4]) : new Date();

function lstHours(longitude, date) {
  const gmst = SiderealTime(date);
  return ((gmst + longitude / 15) % 24 + 24) % 24;
}

function formatHms(hours) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const gmst = SiderealTime(when);
const lst = lstHours(lon, when);

console.log("Sidereal Desk — LST verification");
console.log("─".repeat(40));
console.log(`UTC:       ${when.toISOString()}`);
console.log(`Location:  ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
console.log(`GMST:      ${formatHms(gmst)} (${gmst.toFixed(6)} h)`);
console.log(`LST:       ${formatHms(lst)} (${lst.toFixed(6)} h)`);
console.log("");
console.log("In Stellarium: set same location & UTC, read LST — delta should be < 1 min.");
