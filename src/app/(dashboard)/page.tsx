import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import {
  fetchAdminOverview,
  fetchEmployeeOverview,
  type AdminOverview,
  type EmployeeOverview,
  type OnboardingPlanRow,
  type TimeOffRow,
  type NoticeRow,
} from "./page.queries";
import {
  PageGreeting,
  KpiCard,
  WorkforceCompositionDonut,
  Btn,
  Pill,
  IDoc,
  IPlus,
  ILeave,
  ICal,
  IUser,
  IArrowRight,
  type NoticeView,
  type OnboardingTrackerData,
} from "@/components/curie";
import { TimeOffThisWeekCard } from "@/components/curie/time-off-this-week-card";
import { OnboardingTrackerCard } from "@/components/curie/onboarding-tracker-card";
import { NoticeBoardCard } from "@/components/curie/notice-board-card";
import { cn } from "@/lib/utils";

function getOverviewToday(): Date {
  const override = process.env.OVERVIEW_FREEZE_DATE;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const today = getOverviewToday();
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const data = await fetchAdminOverview(session, today);
    return <AdminOverviewView data={data} />;
  }

  const data = await fetchEmployeeOverview(session, today);
  return <EmployeeOverviewView data={data} />;
}

function AdminOverviewView({ data }: { data: AdminOverview }) {
  const {
    firstName,
    today,
    window,
    headcount,
    openRoles,
    onLeaveToday,
    pendingApprovals,
    workforce,
    timeOffThisWeek,
    onboarding,
    notices,
  } = data;

  return (
    <div className="flex flex-col gap-8 py-2">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageGreeting name={firstName} date={today} />
        <div className="flex flex-wrap items-center gap-2.5">
          <Btn variant="secondary" icon={IDoc}>
            Export report
          </Btn>
          <Btn variant="primary" icon={IPlus}>
            New request
          </Btn>
        </div>
      </header>

      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Headcount"
          value={headcount.total}
          delta={
            headcount.deltaThisMonth > 0
              ? { dir: "up", label: `+${headcount.deltaThisMonth} this month` }
              : { dir: "flat", label: "no change this month" }
          }
          footer={{
            kind: "sparkline",
            points: headcount.sparkline,
            tone: "neutral",
          }}
        />
        <KpiCard
          label="Open roles"
          value={openRoles.count}
          pill={openRoles.priority ? <Pill variant="count">priority</Pill> : undefined}
          delta={
            openRoles.deltaSinceLastWeek > 0
              ? { dir: "up", label: `+${openRoles.deltaSinceLastWeek} since last week` }
              : { dir: "flat", label: "stable" }
          }
          footer={{
            kind: "sparkline",
            points: openRoles.sparkline,
            tone: "brand",
          }}
        />
        <KpiCard
          label="On leave today"
          value={onLeaveToday.count}
          footer={{
            kind: "stack",
            avatars: onLeaveToday.avatars,
            trailing: `of ${onLeaveToday.total}`,
          }}
        />
        <KpiCard
          label="Pending approvals"
          value={pendingApprovals.count}
          unit={`/${pendingApprovals.total}`}
          delta={
            pendingApprovals.clearedToday > 0
              ? { dir: "down", label: `−${pendingApprovals.clearedToday} cleared today` }
              : { dir: "flat", label: "queue steady" }
          }
          footer={{
            kind: "sparkline",
            points: pendingApprovals.sparkline,
            tone: "neutral",
          }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutCard counts={workforce} />
        <TimeOffThisWeekCard
          weekStart={window.weekStart}
          weekEnd={window.weekEnd}
          rows={timeOffThisWeek as TimeOffRow[]}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {onboarding ? (
          <OnboardingTrackerCard data={toOnboardingTrackerData(onboarding)} />
        ) : (
          <EmptyCard title="Onboarding" body="No active onboarding plans." />
        )}
        <NoticeBoardCard notices={notices.map(toNoticeView)} now={today} />
      </section>
    </div>
  );
}

function EmployeeOverviewView({ data }: { data: EmployeeOverview }) {
  const { firstName, today, myLeave, myMeetings } = data;

  return (
    <div className="flex flex-col gap-8 py-2">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageGreeting name={firstName} date={today} />
      </header>

      <section
        aria-label="Quick actions"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <QuickAction
          href="/leave/request"
          icon={<ILeave width={20} height={20} />}
          label="Request leave"
          description="Submit a vacation, day-off, or sick leave"
        />
        <QuickAction
          href="/calendar"
          icon={<ICal width={20} height={20} />}
          label="Calendar"
          description="See upcoming meetings and team availability"
        />
        <QuickAction
          href="/profile"
          icon={<IUser width={20} height={20} />}
          label="My profile"
          description="Personal details, certifications, contacts"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MyLeaveCard leave={myLeave} />
        <UpcomingMeetingsCard meetings={myMeetings} now={today} />
      </section>
    </div>
  );
}

function DonutCard({ counts }: { counts: AdminOverview["workforce"] }) {
  return (
    <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium leading-tight tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Workforce composition
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            By employment type · current month
          </div>
        </div>
        <Link
          href="/employees"
          className={cn(
            "inline-flex items-center gap-1",
            "text-[13px] font-medium",
            "text-[var(--color-curie-fg-secondary)]",
          )}
        >
          View detail <IArrowRight width={14} height={14} />
        </Link>
      </div>
      <WorkforceCompositionDonut counts={counts} />
    </div>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
      <div
        className={cn(
          "font-[family-name:var(--font-curie-display)]",
          "text-[20px] font-medium leading-tight tracking-[-0.015em]",
        )}
      >
        {title}
      </div>
      <p className="mt-2 text-[13px] text-[var(--color-curie-fg-muted)]">{body}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-[var(--radius-curie-lg)] p-5",
        "bg-[var(--color-curie-surface)]",
        "transition-colors hover:bg-[var(--color-curie-surface-sunken)]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-curie-md)]",
          "bg-[var(--color-curie-brand-soft)]",
          "text-[var(--color-curie-brand-ink)]",
        )}
      >
        {icon}
      </span>
      <div>
        <div
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[16px] font-medium tracking-[-0.01em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          {label}
        </div>
        <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
          {description}
        </div>
      </div>
    </Link>
  );
}

function MyLeaveCard({ leave }: { leave: EmployeeOverview["myLeave"] }) {
  return (
    <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium leading-tight tracking-[-0.015em]",
            )}
          >
            My leave
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            Recent requests
          </div>
        </div>
        <Link
          href="/leave"
          className="text-[13px] font-medium text-[var(--color-curie-fg-secondary)]"
        >
          See all →
        </Link>
      </div>
      {leave.length === 0 ? (
        <p className="text-[13px] text-[var(--color-curie-fg-muted)]">
          You haven&apos;t submitted any leave requests.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-curie-border)]">
          {leave.map((lr) => (
            <li key={lr.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="text-[14px] font-semibold text-[var(--color-curie-fg)]">
                  {formatLeaveType(lr.type)}
                </div>
                <div
                  className={cn(
                    "font-[family-name:var(--font-curie-mono)]",
                    "text-[12px] text-[var(--color-curie-fg-muted)]",
                  )}
                >
                  {formatDateRange(lr.startDate, lr.endDate)}
                </div>
              </div>
              <LeaveStatusPill status={lr.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UpcomingMeetingsCard({
  meetings,
  now,
}: {
  meetings: EmployeeOverview["myMeetings"];
  now: Date;
}) {
  return (
    <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium leading-tight tracking-[-0.015em]",
            )}
          >
            Today
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            Your meetings
          </div>
        </div>
        <Link
          href="/calendar"
          className="text-[13px] font-medium text-[var(--color-curie-fg-secondary)]"
        >
          See all →
        </Link>
      </div>
      {meetings.length === 0 ? (
        <p className="text-[13px] text-[var(--color-curie-fg-muted)]">
          Nothing scheduled today.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {meetings.map((m) => {
            const end = new Date(m.scheduledAt.getTime() + m.durationMinutes * 60_000);
            const isNow =
              now.getTime() >= m.scheduledAt.getTime() && now.getTime() < end.getTime();
            return (
              <li key={m.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-[var(--color-curie-fg)]">
                    {m.title}
                  </div>
                  <div
                    className={cn(
                      "font-[family-name:var(--font-curie-mono)]",
                      "text-[12px] text-[var(--color-curie-fg-muted)]",
                    )}
                  >
                    {formatTime(m.scheduledAt)} — {formatTime(end)}
                    {isNow ? " · Now" : ""}
                  </div>
                </div>
                <Pill variant={isNow ? "status-info" : "tag"}>{m.badge.label}</Pill>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LeaveStatusPill({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  if (status === "PENDING") return <Pill variant="status-pending">Pending</Pill>;
  if (status === "APPROVED") return <Pill variant="status-approved">Approved</Pill>;
  return <Pill variant="status-rejected">Rejected</Pill>;
}

function toNoticeView(notice: NoticeRow): NoticeView {
  return {
    id: notice.id,
    author: notice.author,
    tag: notice.tag,
    createdAt: notice.createdAt,
    body: notice.body,
    title: notice.title,
  };
}

function toOnboardingTrackerData(row: OnboardingPlanRow): OnboardingTrackerData {
  return {
    employeeName: row.employeeName,
    position: row.position,
    startDate: row.startDate,
    status: row.status,
    steps: row.steps,
  };
}

const LEAVE_TYPE_LABEL: Record<string, string> = {
  SICK_LEAVE: "Sick leave",
  DAY_OFF: "Day off",
  VACATION: "Vacation",
};

function formatLeaveType(type: string): string {
  return LEAVE_TYPE_LABEL[type] ?? type;
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function shortDate(date: Date): string {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function formatDateRange(start: Date, end: Date): string {
  return start.getTime() === end.getTime()
    ? shortDate(start)
    : `${shortDate(start)} → ${shortDate(end)}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(date: Date): string {
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}
