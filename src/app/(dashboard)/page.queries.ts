import "server-only";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  nextBirthdays,
  nextAnniversaries,
  type ComingUpEmployee,
  type BirthdayEntry,
  type AnniversaryEntry,
} from "@/lib/coming-up";
import type { WorkforceCount } from "@/components/curie";
import type { LeaveStatus, LeaveType } from "@prisma/client";

const MS_PER_DAY = 86_400_000;

export interface DateWindow {
  weekStart: Date;
  weekEnd: Date;
  monthStart: Date;
  monthEnd: Date;
  todayStart: Date;
  todayEnd: Date;
  eightWeeksAgo: Date;
  sevenDaysAgo: Date;
}

export function getDateWindow(today: Date): DateWindow {
  const todayStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const todayEnd = new Date(todayStart.getTime() + MS_PER_DAY);

  const dow = todayStart.getUTCDay();
  const mondayOffset = (dow + 6) % 7;
  const weekStart = new Date(todayStart.getTime() - mondayOffset * MS_PER_DAY);
  const weekEnd = new Date(weekStart.getTime() + 7 * MS_PER_DAY);

  const monthStart = new Date(
    Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1),
  );
  const monthEnd = new Date(
    Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth() + 1, 1),
  );

  const eightWeeksAgo = new Date(todayStart.getTime() - 56 * MS_PER_DAY);
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * MS_PER_DAY);

  return {
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    todayStart,
    todayEnd,
    eightWeeksAgo,
    sevenDaysAgo,
  };
}

const WORKFORCE_PALETTE = ["#0B0F1A", "#64748B", "#CBD5E1", "#2563EB"];

export interface TimeOffRow {
  id: string;
  name: string;
  position: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
}

export interface NoticeRow {
  id: string;
  author: string;
  tag: "POLICY" | "TEAM" | "HR" | "EVENT";
  createdAt: Date;
  body: string;
  title: string;
}

export interface OnboardingStepRow {
  ord: number;
  label: string;
  status: "DONE" | "CURRENT" | "UPCOMING";
  meta?: string;
}

export interface OnboardingPlanRow {
  employeeName: string;
  position: string;
  startDate: Date;
  status: "ON_TRACK" | "AT_RISK" | "BLOCKED" | "COMPLETE";
  steps: OnboardingStepRow[];
}

export interface ScheduleRow {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  participants: { name: string }[];
  badge: { kind: "Meet" | "Final" | "Room"; label: string };
}

export interface MyLeaveRow {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  reason: string | null;
}

export interface AdminOverview {
  today: Date;
  window: DateWindow;
  firstName: string;
  headcount: { total: number; sparkline: number[]; deltaThisMonth: number };
  openRoles: { count: number; priority: boolean; sparkline: number[]; deltaSinceLastWeek: number };
  onLeaveToday: { count: number; total: number; avatars: { name: string }[] };
  pendingApprovals: { count: number; total: number; sparkline: number[]; clearedToday: number };
  workforce: WorkforceCount[];
  timeOffThisWeek: TimeOffRow[];
  onboarding: OnboardingPlanRow | null;
  notices: NoticeRow[];
  monthEvents: Date[];
  todaySchedule: ScheduleRow[];
  comingUp: { birthdays: BirthdayEntry[]; anniversaries: AnniversaryEntry[] };
}

export interface EmployeeOverview {
  today: Date;
  window: DateWindow;
  firstName: string;
  myLeave: MyLeaveRow[];
  myMeetings: ScheduleRow[];
  myMonthEvents: Date[];
  myTodaySchedule: ScheduleRow[];
}

function shortMonth(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function deriveBadge(meeting: {
  type: string;
  notes: string | null;
}): ScheduleRow["badge"] {
  const raw = (meeting.notes ?? meeting.type ?? "Meet").trim();
  if (/room/i.test(raw)) return { kind: "Room", label: raw };
  if (/final/i.test(raw)) return { kind: "Final", label: "Final" };
  return { kind: "Meet", label: "Meet" };
}

async function buildHeadcountSparkline(
  today: Date,
  windowStart: Date,
): Promise<{ total: number; sparkline: number[]; deltaThisMonth: number }> {
  const allEmployees = await prisma.employee.findMany({
    select: { createdAt: true },
  });

  const total = allEmployees.length;

  const buckets: number[] = Array(8).fill(0);
  for (let i = 0; i < 8; i++) {
    const weekEnd = new Date(windowStart.getTime() + (i + 1) * 7 * MS_PER_DAY);
    buckets[i] = allEmployees.filter(
      (e) => e.createdAt.getTime() <= weekEnd.getTime(),
    ).length;
  }

  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const deltaThisMonth = allEmployees.filter(
    (e) => e.createdAt.getTime() >= monthStart.getTime(),
  ).length;

  return { total, sparkline: buckets, deltaThisMonth };
}

async function buildPendingSparkline(
  today: Date,
  sevenDaysAgo: Date,
  monthStart: Date,
): Promise<{ count: number; total: number; sparkline: number[]; clearedToday: number }> {
  const [pendingCount, monthTotal, history, clearedTodayCount] = await Promise.all([
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.leaveRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.leaveRequest.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true, reviewedAt: true },
    }),
    prisma.leaveRequest.count({
      where: {
        reviewedAt: {
          gte: new Date(
            Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
          ),
        },
      },
    }),
  ]);

  const sparkline: number[] = Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(sevenDaysAgo.getTime() + i * MS_PER_DAY);
    const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);
    sparkline[i] = history.filter(
      (h) =>
        h.createdAt.getTime() >= dayStart.getTime() &&
        h.createdAt.getTime() < dayEnd.getTime(),
    ).length;
  }

  return { count: pendingCount, total: monthTotal, sparkline, clearedToday: clearedTodayCount };
}

async function buildOpenRoles(): Promise<{
  count: number;
  priority: boolean;
  sparkline: number[];
  deltaSinceLastWeek: number;
}> {
  const [rows, priorityCount] = await Promise.all([
    prisma.jobRequisition.findMany({
      where: { status: "OPEN" },
      select: { openedAt: true, priority: true },
    }),
    prisma.jobRequisition.count({ where: { status: "OPEN", priority: true } }),
  ]);
  const count = rows.length;
  const sparkline = Array(8)
    .fill(0)
    .map((_, i) => Math.max(0, count - (7 - i)));
  return { count, priority: priorityCount > 0, sparkline, deltaSinceLastWeek: priorityCount };
}

async function fetchWorkforce(): Promise<WorkforceCount[]> {
  const grouped = await prisma.employee.groupBy({
    by: ["employmentTypeId"],
    _count: { _all: true },
  });
  const types = await prisma.employmentType.findMany({
    where: { id: { in: grouped.map((g) => g.employmentTypeId) } },
    select: { id: true, name: true },
  });
  const labelById = new Map(types.map((t) => [t.id, t.name]));
  return grouped
    .map((g, i) => ({
      label: labelById.get(g.employmentTypeId) ?? "Unknown",
      count: g._count._all,
      color: WORKFORCE_PALETTE[i % WORKFORCE_PALETTE.length],
    }))
    .sort((a, b) => b.count - a.count)
    .map((c, i) => ({ ...c, color: WORKFORCE_PALETTE[i % WORKFORCE_PALETTE.length] }));
}

async function fetchTimeOffThisWeek(
  weekStart: Date,
  weekEnd: Date,
): Promise<TimeOffRow[]> {
  const rows = await prisma.leaveRequest.findMany({
    where: { startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
    orderBy: { startDate: "asc" },
    take: 5,
    include: {
      user: {
        select: {
          employee: {
            select: { firstName: true, lastName: true, position: true, department: true },
          },
        },
      },
    },
  });
  return rows
    .filter((r) => r.user.employee != null)
    .map((r) => {
      const e = r.user.employee!;
      const position = [e.department, e.position].filter(Boolean).join(" · ");
      return {
        id: r.id,
        name: `${e.firstName} ${e.lastName}`,
        position: position || "—",
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
      };
    });
}

async function fetchActiveOnboarding(): Promise<OnboardingPlanRow | null> {
  const plan = await prisma.onboardingPlan.findFirst({
    where: { status: { not: "COMPLETE" } },
    orderBy: { startDate: "asc" },
    include: {
      employee: { select: { firstName: true, lastName: true, position: true } },
      steps: { orderBy: { ord: "asc" } },
    },
  });
  if (!plan) return null;
  return {
    employeeName: `${plan.employee.firstName} ${plan.employee.lastName}`,
    position: plan.employee.position ?? "",
    startDate: plan.startDate,
    status: plan.status,
    steps: plan.steps.map((s) => ({
      ord: s.ord,
      label: s.label,
      status: s.status,
      meta:
        s.status === "DONE" && s.completedAt
          ? shortMonth(s.completedAt)
          : s.status === "CURRENT"
            ? "In progress"
            : undefined,
    })),
  };
}

async function fetchNotices(): Promise<NoticeRow[]> {
  const rows = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: {
        select: {
          employee: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    author: r.author.employee
      ? `${r.author.employee.firstName} ${r.author.employee.lastName}`
      : "Anonymous",
    tag: r.tag,
    createdAt: r.createdAt,
    title: r.title,
    body: r.body,
  }));
}

async function fetchMonthEvents(
  monthStart: Date,
  monthEnd: Date,
  filter?: { userId: string },
): Promise<Date[]> {
  const meetingWhere: Record<string, unknown> = {
    scheduledAt: { gte: monthStart, lt: monthEnd },
  };
  if (filter) {
    meetingWhere.participants = { some: { userId: filter.userId } };
  }
  const leaveWhere: Record<string, unknown> = {
    startDate: { lt: monthEnd },
    endDate: { gte: monthStart },
  };
  if (filter) {
    leaveWhere.userId = filter.userId;
  }

  const [meetings, leaves] = await Promise.all([
    prisma.meeting.findMany({
      where: meetingWhere,
      select: { scheduledAt: true },
    }),
    prisma.leaveRequest.findMany({
      where: leaveWhere,
      select: { startDate: true, endDate: true },
    }),
  ]);

  const dateSet = new Set<string>();
  for (const m of meetings) {
    const d = m.scheduledAt;
    const key = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    dateSet.add(String(key));
  }
  for (const l of leaves) {
    let cursor = new Date(
      Date.UTC(
        l.startDate.getUTCFullYear(),
        l.startDate.getUTCMonth(),
        l.startDate.getUTCDate(),
      ),
    );
    const end = new Date(
      Date.UTC(
        l.endDate.getUTCFullYear(),
        l.endDate.getUTCMonth(),
        l.endDate.getUTCDate(),
      ),
    );
    while (cursor.getTime() <= end.getTime()) {
      if (cursor.getTime() >= monthStart.getTime() && cursor.getTime() < monthEnd.getTime()) {
        dateSet.add(String(cursor.getTime()));
      }
      cursor = new Date(cursor.getTime() + MS_PER_DAY);
    }
  }
  return Array.from(dateSet)
    .map((s) => new Date(Number(s)))
    .sort((a, b) => a.getTime() - b.getTime());
}

async function fetchTodaySchedule(
  todayStart: Date,
  todayEnd: Date,
  filter?: { userId: string },
): Promise<ScheduleRow[]> {
  const where: Record<string, unknown> = {
    scheduledAt: { gte: todayStart, lt: todayEnd },
  };
  if (filter) {
    where.participants = { some: { userId: filter.userId } };
  }
  const rows = await prisma.meeting.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              employee: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });
  return rows.map((m) => ({
    id: m.id,
    title: m.title,
    scheduledAt: m.scheduledAt,
    durationMinutes: m.durationMinutes,
    participants: m.participants
      .map((p) =>
        p.user.employee
          ? { name: `${p.user.employee.firstName} ${p.user.employee.lastName}` }
          : null,
      )
      .filter((p): p is { name: string } => p != null),
    badge: deriveBadge({ type: m.type, notes: m.notes }),
  }));
}

async function fetchComingUp(
  today: Date,
  windowDays: number,
): Promise<{ birthdays: BirthdayEntry[]; anniversaries: AnniversaryEntry[] }> {
  const rows = await prisma.employee.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      startDate: true,
    },
  });
  const list: ComingUpEmployee[] = rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    dateOfBirth: r.dateOfBirth,
    startDate: r.startDate,
  }));
  return {
    birthdays: nextBirthdays(list, today, windowDays),
    anniversaries: nextAnniversaries(list, today, windowDays),
  };
}

export async function fetchAdminOverview(
  session: Session,
  today: Date = new Date(),
): Promise<AdminOverview> {
  const window = getDateWindow(today);

  const [
    employeeProfile,
    headcount,
    openRoles,
    pendingApprovals,
    workforce,
    onLeaveTodayRows,
    timeOffThisWeek,
    onboarding,
    notices,
    monthEvents,
    todaySchedule,
    comingUp,
    employeesTotal,
  ] = await Promise.all([
    prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { firstName: true },
    }),
    buildHeadcountSparkline(today, window.eightWeeksAgo),
    buildOpenRoles(),
    buildPendingSparkline(today, window.sevenDaysAgo, window.monthStart),
    fetchWorkforce(),
    prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: { lte: window.todayEnd },
        endDate: { gte: window.todayStart },
      },
      include: {
        user: {
          select: {
            employee: { select: { firstName: true, lastName: true } },
          },
        },
      },
      take: 6,
    }),
    fetchTimeOffThisWeek(window.weekStart, window.weekEnd),
    fetchActiveOnboarding(),
    fetchNotices(),
    fetchMonthEvents(window.monthStart, window.monthEnd),
    fetchTodaySchedule(window.todayStart, window.todayEnd),
    fetchComingUp(today, 14),
    prisma.employee.count(),
  ]);

  const onLeaveAvatars = onLeaveTodayRows
    .filter((r) => r.user.employee != null)
    .map((r) => ({
      name: `${r.user.employee!.firstName} ${r.user.employee!.lastName}`,
    }))
    .slice(0, 3);

  return {
    today,
    window,
    firstName: employeeProfile?.firstName ?? session.user.name ?? "there",
    headcount: {
      total: headcount.total,
      sparkline: headcount.sparkline,
      deltaThisMonth: headcount.deltaThisMonth,
    },
    openRoles,
    onLeaveToday: {
      count: onLeaveTodayRows.length,
      total: employeesTotal,
      avatars: onLeaveAvatars,
    },
    pendingApprovals,
    workforce,
    timeOffThisWeek,
    onboarding,
    notices,
    monthEvents,
    todaySchedule,
    comingUp,
  };
}

export interface AdminRailData {
  today: Date;
  window: DateWindow;
  monthEvents: Date[];
  todaySchedule: ScheduleRow[];
  comingUpEmployees: ComingUpEmployee[];
}

export interface EmployeeRailData {
  today: Date;
  window: DateWindow;
  monthEvents: Date[];
  todaySchedule: ScheduleRow[];
}

export async function fetchAdminRailData(
  today: Date = new Date(),
): Promise<AdminRailData> {
  const window = getDateWindow(today);
  const [monthEvents, todaySchedule, employeeRows] = await Promise.all([
    fetchMonthEvents(window.monthStart, window.monthEnd),
    fetchTodaySchedule(window.todayStart, window.todayEnd),
    prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        startDate: true,
      },
    }),
  ]);
  const comingUpEmployees: ComingUpEmployee[] = employeeRows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    dateOfBirth: r.dateOfBirth,
    startDate: r.startDate,
  }));
  return { today, window, monthEvents, todaySchedule, comingUpEmployees };
}

export async function fetchEmployeeRailData(
  session: Session,
  today: Date = new Date(),
): Promise<EmployeeRailData> {
  const window = getDateWindow(today);
  const userId = session.user.id;
  const [monthEvents, todaySchedule] = await Promise.all([
    fetchMonthEvents(window.monthStart, window.monthEnd, { userId }),
    fetchTodaySchedule(window.todayStart, window.todayEnd, { userId }),
  ]);
  return { today, window, monthEvents, todaySchedule };
}

export async function fetchEmployeeOverview(
  session: Session,
  today: Date = new Date(),
): Promise<EmployeeOverview> {
  const window = getDateWindow(today);
  const userId = session.user.id;

  const [employeeProfile, myLeaveRows, myMonthEvents, myTodaySchedule] = await Promise.all([
    prisma.employee.findFirst({
      where: { userId },
      select: { firstName: true },
    }),
    prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    }),
    fetchMonthEvents(window.monthStart, window.monthEnd, { userId }),
    fetchTodaySchedule(window.todayStart, window.todayEnd, { userId }),
  ]);

  return {
    today,
    window,
    firstName: employeeProfile?.firstName ?? session.user.name ?? "there",
    myLeave: myLeaveRows,
    myMeetings: myTodaySchedule,
    myMonthEvents,
    myTodaySchedule,
  };
}
