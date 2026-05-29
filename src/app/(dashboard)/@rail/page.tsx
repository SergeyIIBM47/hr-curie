import { requireAuth } from "@/lib/auth-guard";
import { cn } from "@/lib/utils";
import {
  fetchAdminRailData,
  fetchEmployeeRailData,
} from "../page.queries";
import {
  MiniCalendar,
  type ScheduleItem,
} from "@/components/curie";
import { TodayScheduleList } from "@/components/curie/today-schedule-list";
import { ComingUpList } from "@/components/curie/coming-up-list";

function getRailToday(): Date {
  const override = process.env.OVERVIEW_FREEZE_DATE;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default async function RailPage() {
  const session = await requireAuth();
  const today = getRailToday();
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const data = await fetchAdminRailData(today);
    const items: ScheduleItem[] = data.todaySchedule.map((row) => ({
      id: row.id,
      title: row.title,
      scheduledAt: row.scheduledAt,
      durationMinutes: row.durationMinutes,
      participants: row.participants,
      badge: row.badge,
    }));
    return (
      <div className="flex flex-col gap-7">
        <RailSection title={formatMonthYear(data.window.monthStart)}>
          <MiniCalendar
            events={data.monthEvents}
            selected={today}
            today={today}
            initialMonth={data.window.monthStart}
          />
        </RailSection>
        <RailSection
          title="Today"
          link={{ href: "/calendar", label: "See all →" }}
        >
          <TodayScheduleList date={today} now={today} items={items} />
        </RailSection>
        <RailSection title="Coming up">
          <ComingUpList today={today} employees={data.comingUpEmployees} />
        </RailSection>
      </div>
    );
  }

  const data = await fetchEmployeeRailData(session, today);
  const items: ScheduleItem[] = data.todaySchedule.map((row) => ({
    id: row.id,
    title: row.title,
    scheduledAt: row.scheduledAt,
    durationMinutes: row.durationMinutes,
    participants: row.participants,
    badge: row.badge,
  }));
  return (
    <div className="flex flex-col gap-7">
      <RailSection title={formatMonthYear(data.window.monthStart)}>
        <MiniCalendar
          events={data.monthEvents}
          selected={today}
          today={today}
          initialMonth={data.window.monthStart}
        />
      </RailSection>
      <RailSection
        title="Today"
        link={{ href: "/calendar", label: "See all →" }}
      >
        <TodayScheduleList date={today} now={today} items={items} />
      </RailSection>
    </div>
  );
}

function RailSection({
  title,
  link,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[16px] font-medium tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          {title}
        </div>
        {link ? (
          <a
            href={link.href}
            className="text-[12px] font-medium text-[var(--color-curie-fg-secondary)]"
          >
            {link.label}
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthYear(date: Date): string {
  return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
