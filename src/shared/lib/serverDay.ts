const ZONE = "Asia/Ho_Chi_Minh";

function calendarDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function serverDay(openedOn: string, now = new Date()): number {
  const today = Date.parse(`${calendarDay(now)}T00:00:00Z`);
  const opened = Date.parse(`${openedOn.slice(0, 10)}T00:00:00Z`);
  const diff = Math.floor((today - opened) / 86_400_000) + 1;
  return Math.max(1, diff);
}

export function shiftCalendarDay(days: number, now = new Date()): string {
  const today = Date.parse(`${calendarDay(now)}T00:00:00Z`);
  return new Date(today + days * 86_400_000).toISOString().slice(0, 10);
}
