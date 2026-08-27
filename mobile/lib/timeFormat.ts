/** "13:15" (or "13:15:00", as Postgres `time` columns come back) -> "1:15 PM".
 *  Falls back to the raw string if it doesn't look like a time at all, rather
 *  than showing nothing. */
export function formatTime12h(time: string | null | undefined): string | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  const h = parseInt(match[1], 10);
  const m = match[2];
  if (Number.isNaN(h) || h > 23) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}
