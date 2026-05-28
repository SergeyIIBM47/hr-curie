export interface ComingUpEmployee {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  startDate: Date | null;
}

export interface BirthdayEntry {
  id: string;
  name: string;
  date: Date;
}

export interface AnniversaryEntry {
  id: string;
  name: string;
  date: Date;
  years: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function nextOccurrenceInWindow(
  month: number,
  day: number,
  today: Date,
  windowDays: number,
): Date | null {
  const todayUtc = startOfDayUTC(today);
  const todayYear = todayUtc.getUTCFullYear();

  const candidates: Date[] = [];
  for (const year of [todayYear, todayYear + 1]) {
    let occMonth = month;
    let occDay = day;
    if (month === 1 && day === 29 && !isLeapYear(year)) {
      occMonth = 2;
      occDay = 1;
    }
    candidates.push(new Date(Date.UTC(year, occMonth, occDay)));
  }

  for (const candidate of candidates) {
    const diffDays = Math.floor((candidate.getTime() - todayUtc.getTime()) / MS_PER_DAY);
    if (diffDays >= 0 && diffDays <= windowDays) {
      return candidate;
    }
  }
  return null;
}

export function nextBirthdays(
  employees: ComingUpEmployee[],
  today: Date,
  windowDays: number,
): BirthdayEntry[] {
  const entries: BirthdayEntry[] = [];
  for (const emp of employees) {
    const birth = emp.dateOfBirth;
    const occurrence = nextOccurrenceInWindow(
      birth.getUTCMonth(),
      birth.getUTCDate(),
      today,
      windowDays,
    );
    if (occurrence) {
      entries.push({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        date: occurrence,
      });
    }
  }
  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function nextAnniversaries(
  employees: ComingUpEmployee[],
  today: Date,
  windowDays: number,
): AnniversaryEntry[] {
  const todayUtc = startOfDayUTC(today);
  const entries: AnniversaryEntry[] = [];
  for (const emp of employees) {
    if (!emp.startDate) continue;
    const start = emp.startDate;
    const occurrence = nextOccurrenceInWindow(
      start.getUTCMonth(),
      start.getUTCDate(),
      today,
      windowDays,
    );
    if (!occurrence) continue;
    const years = occurrence.getUTCFullYear() - start.getUTCFullYear();
    if (years <= 0) continue;
    entries.push({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      date: occurrence,
      years,
    });
    void todayUtc;
  }
  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}
