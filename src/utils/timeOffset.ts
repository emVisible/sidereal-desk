/** Format ms offset from real now as +2h 15m / -30m */
export function formatTimeOffset(epochMs: number, now = Date.now()): string {
  const diffMs = epochMs - now;
  const sign = diffMs >= 0 ? "+" : "-";
  const absMin = Math.round(Math.abs(diffMs) / 60_000);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function formatSimDate(epochMs: number, locale: string): string {
  return new Date(epochMs).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
