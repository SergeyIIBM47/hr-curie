import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { cn } from "@/lib/utils";
import { TodayScheduleList, type ScheduleItem } from "@/components/curie";
import { fetchEmployeeRailData } from "../../page.queries";

function getRailToday(): Date {
  const override = process.env.OVERVIEW_FREEZE_DATE;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default async function ProfileRailPage() {
  const session = await requireAuth();
  const today = getRailToday();
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
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[16px] font-medium tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Today
          </div>
          <Link
            href="/calendar"
            className="text-[12px] font-medium text-[var(--color-curie-fg-secondary)]"
          >
            See all →
          </Link>
        </div>
        <TodayScheduleList date={today} now={today} items={items} />
      </section>
    </div>
  );
}
