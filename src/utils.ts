export const dowTR = (jsDow: number) => (jsDow + 6) % 7;

export function fixDateStringWithYear(dateStr: string) {
  const parts = dateStr.split(".");
  if (parts.length === 3 && parts[2].length === 2) {
    return `${parts[0]}.${parts[1]}.20${parts[2]}`;
  }
  return dateStr;
}

export function buildMonthGrid(year: number, month0: number) {
  const first = new Date(year, month0, 1);
  const weekday = dowTR(first.getDay());
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < weekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  if (cells.length < 42) {
    while (cells.length < 42) cells.push(null);
  }
  return cells;
}

export function keyOf(d: number, m0: number, y: number) {
  return `${d}.${m0 + 1}.${y}`; 
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateTwoRandomDateTimesWithinAWeek(): Date[] {
  const now = new Date();
  const results: Date[] = [];
  for (let i = 0; i < 2; i++) {
    const dayOffset = randomInt(1, 7);
    const hour = randomInt(10, 20); 
    const minuteChoices = [0, 10, 20, 30, 40, 50];
    const minute = minuteChoices[randomInt(0, minuteChoices.length - 1)];
    const d = new Date(now);
    d.setDate(now.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    results.push(d);
  }
  return results;
}

export function isVersionLess(v1: string, v2: string) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    if (n1 < n2) return true;
    if (n1 > n2) return false;
  }
  return false;
}

export function buildReminderDateTime(d:number, m:number, y:number, h:number, min:number): Date {
    const date = new Date(y, m - 1, d, h, min, 0);
    return date;
}

export const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
};