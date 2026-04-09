import type { ReactNode } from "react";
import Link from "next/link";
import type { LeaveType, LeaveStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  Users,
  CalendarOff,
  Calendar,
  UserPlus,
  CalendarDays,
  ClipboardList,
  User,
} from "lucide-react";

/* ── Stat card (shared) ──────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  href?: string;
}

function StatCard({ label, value, icon, href }: StatCardProps) {
  const inner = (
    <div className="relative rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="absolute right-5 top-5">{icon}</div>
      <p className="text-[34px] font-bold leading-tight text-[#1D1D1F]">
        {value}
      </p>
      <p className="mt-1 text-[16px] text-gray-1">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-all duration-150 hover:opacity-90 active:scale-[0.98]">
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ── Admin view ──────────────────────────────────────────────── */

interface AdminDashboardProps {
  totalEmployees: number;
  pendingRequests: number;
  meetingsThisWeek: number;
  newThisMonth: number;
  recentLeave: RecentLeaveItem[];
  upcomingMeetings: UpcomingMeetingItem[];
}

interface RecentLeaveItem {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  employeeName?: string;
}

interface UpcomingMeetingItem {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  participantCount: number;
}

function AdminDashboard({
  totalEmployees,
  pendingRequests,
  meetingsThisWeek,
  newThisMonth,
  recentLeave,
  upcomingMeetings,
}: AdminDashboardProps) {
  return (
    <div>
      <h1 className="mb-6 text-[28px] font-bold text-[#1D1D1F]">Dashboard</h1>

      {/* Stat cards */}
      <section aria-label="Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-6 w-6 text-apple-blue" />}
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          icon={<CalendarOff className="h-6 w-6 text-apple-orange" />}
          href="/leave/manage"
        />
        <StatCard
          label="Meetings This Week"
          value={meetingsThisWeek}
          icon={<Calendar className="h-6 w-6 text-apple-indigo" />}
        />
        <StatCard
          label="New This Month"
          value={newThisMonth}
          icon={<UserPlus className="h-6 w-6 text-apple-green" />}
        />
      </section>

      {/* Recent lists */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Leave Requests */}
        <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
              Recent Leave Requests
            </h2>
            <Link
              href="/leave"
              className="text-[15px] font-medium text-apple-blue"
            >
              View all
            </Link>
          </div>
          {recentLeave.length === 0 ? (
            <p className="py-4 text-center text-[15px] text-[#8E8E93]">
              No leave requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E5EA]">
              {recentLeave.map((lr) => (
                <li key={lr.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[#1D1D1F]">
                      {lr.employeeName}
                    </p>
                    <p className="text-[13px] text-[#8E8E93]">
                      {formatLeaveType(lr.type)} &middot;{" "}
                      {formatDateRange(lr.startDate, lr.endDate)}
                    </p>
                  </div>
                  <LeaveStatusBadge status={lr.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
              Upcoming Meetings
            </h2>
            <Link
              href="/calendar"
              className="text-[15px] font-medium text-apple-blue"
            >
              View all
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <p className="py-4 text-center text-[15px] text-[#8E8E93]">
              No upcoming meetings.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E5EA]">
              {upcomingMeetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[#1D1D1F]">
                      {m.title}
                    </p>
                    <p className="text-[13px] text-[#8E8E93]">
                      {formatMeetingTime(m.scheduledAt)} &middot;{" "}
                      {m.durationMinutes} min &middot; {m.participantCount}{" "}
                      {m.participantCount === 1 ? "person" : "people"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Employee view ───────────────────────────────────────────── */

interface EmployeeDashboardProps {
  name: string;
  myLeave: RecentLeaveItem[];
  myMeetings: UpcomingMeetingItem[];
}

function EmployeeDashboard({
  name,
  myLeave,
  myMeetings,
}: EmployeeDashboardProps) {
  return (
    <div>
      <h1 className="mb-2 text-[28px] font-bold text-[#1D1D1F]">
        Welcome, {name}
      </h1>
      <p className="mb-6 text-[15px] text-[#8E8E93]">
        Here&apos;s what&apos;s happening for you.
      </p>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickAction
          href="/leave/request"
          icon={<ClipboardList className="h-6 w-6 text-apple-blue" />}
          label="Request Leave"
        />
        <QuickAction
          href="/calendar"
          icon={<CalendarDays className="h-6 w-6 text-apple-indigo" />}
          label="Calendar"
        />
        <QuickAction
          href="/profile"
          icon={<User className="h-6 w-6 text-apple-green" />}
          label="My Profile"
        />
      </div>

      {/* Own data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Leave Requests */}
        <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
              My Leave Requests
            </h2>
            <Link
              href="/leave"
              className="text-[15px] font-medium text-apple-blue"
            >
              View all
            </Link>
          </div>
          {myLeave.length === 0 ? (
            <p className="py-4 text-center text-[15px] text-[#8E8E93]">
              No leave requests.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E5EA]">
              {myLeave.map((lr) => (
                <li key={lr.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[#1D1D1F]">
                      {formatLeaveType(lr.type)}
                    </p>
                    <p className="text-[13px] text-[#8E8E93]">
                      {formatDateRange(lr.startDate, lr.endDate)}
                    </p>
                  </div>
                  <LeaveStatusBadge status={lr.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* My Upcoming Meetings */}
        <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
              Upcoming Meetings
            </h2>
            <Link
              href="/calendar"
              className="text-[15px] font-medium text-apple-blue"
            >
              View all
            </Link>
          </div>
          {myMeetings.length === 0 ? (
            <p className="py-4 text-center text-[15px] text-[#8E8E93]">
              No upcoming meetings.
            </p>
          ) : (
            <ul className="divide-y divide-[#E5E5EA]">
              {myMeetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[15px] font-medium text-[#1D1D1F]">
                      {m.title}
                    </p>
                    <p className="text-[13px] text-[#8E8E93]">
                      {formatMeetingTime(m.scheduledAt)} &middot;{" "}
                      {m.durationMinutes} min
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Quick action card ───────────────────────────────────────── */

interface QuickActionProps {
  href: string;
  icon: ReactNode;
  label: string;
}

function QuickAction({ href, icon, label }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[10px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-150 hover:bg-[#F9F9FB] active:scale-[0.98]"
    >
      {icon}
      <span className="text-[15px] font-medium text-[#1D1D1F]">{label}</span>
    </Link>
  );
}

/* ── Leave status badge ──────────────────────────────────────── */

function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const styles: Record<string, string> = {
    PENDING: "bg-[#FF9500]/10 text-[#FF9500]",
    APPROVED: "bg-[#34C759]/10 text-[#34C759]",
    REJECTED: "bg-[#FF3B30]/10 text-[#FF3B30]",
  };

  const labels: Record<string, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold ${styles[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

/* ── Formatters ──────────────────────────────────────────────── */

function formatLeaveType(type: LeaveType): string {
  const map: Record<string, string> = {
    SICK_LEAVE: "Sick Leave",
    DAY_OFF: "Day Off",
    VACATION: "Vacation",
  };
  return map[type] ?? type;
}

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

function formatMeetingTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Page (server component) ─────────────────────────────────── */

export default async function DashboardPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const now = new Date();

  // Week boundaries (Mon–Sun)
  const dow = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((dow + 6) % 7));
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);

  // Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (isAdmin) {
    const [
      totalEmployees,
      pendingRequests,
      meetingsThisWeek,
      newThisMonth,
      recentLeaveRaw,
      upcomingMeetingsRaw,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.meeting.count({
        where: { scheduledAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.employee.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.leaveRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          user: {
            select: {
              employee: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.meeting.findMany({
        where: { scheduledAt: { gte: now } },
        take: 5,
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          durationMinutes: true,
          _count: { select: { participants: true } },
        },
      }),
    ]);

    const recentLeave: RecentLeaveItem[] = recentLeaveRaw.map((lr) => ({
      id: lr.id,
      type: lr.type,
      status: lr.status,
      startDate: lr.startDate.toISOString(),
      endDate: lr.endDate.toISOString(),
      employeeName: lr.user.employee
        ? `${lr.user.employee.firstName} ${lr.user.employee.lastName}`
        : "Unknown",
    }));

    const upcomingMeetings: UpcomingMeetingItem[] = upcomingMeetingsRaw.map(
      (m) => ({
        id: m.id,
        title: m.title,
        scheduledAt: m.scheduledAt.toISOString(),
        durationMinutes: m.durationMinutes,
        participantCount: m._count.participants,
      }),
    );

    return (
      <AdminDashboard
        totalEmployees={totalEmployees}
        pendingRequests={pendingRequests}
        meetingsThisWeek={meetingsThisWeek}
        newThisMonth={newThisMonth}
        recentLeave={recentLeave}
        upcomingMeetings={upcomingMeetings}
      />
    );
  }

  // Employee view — all three queries in parallel
  const [employee, myLeaveRaw, myMeetingsRaw] = await Promise.all([
    prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { firstName: true },
    }),
    prisma.leaveRequest.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    }),
    prisma.meeting.findMany({
      where: {
        scheduledAt: { gte: now },
        participants: { some: { userId: session.user.id } },
      },
      take: 5,
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        durationMinutes: true,
        _count: { select: { participants: true } },
      },
    }),
  ]);

  const myLeave: RecentLeaveItem[] = myLeaveRaw.map((lr) => ({
    id: lr.id,
    type: lr.type,
    status: lr.status,
    startDate: lr.startDate.toISOString(),
    endDate: lr.endDate.toISOString(),
  }));

  const myMeetings: UpcomingMeetingItem[] = myMeetingsRaw.map((m) => ({
    id: m.id,
    title: m.title,
    scheduledAt: m.scheduledAt.toISOString(),
    durationMinutes: m.durationMinutes,
    participantCount: m._count.participants,
  }));

  return (
    <EmployeeDashboard
      name={employee?.firstName ?? session.user.name ?? "there"}
      myLeave={myLeave}
      myMeetings={myMeetings}
    />
  );
}
