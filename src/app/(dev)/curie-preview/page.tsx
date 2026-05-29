import { notFound } from "next/navigation";
import {
  Avatar,
  AvatarStack,
  Pill,
  Sparkline,
  Btn,
  IconBtn,
  IHome,
  IUser,
  IUsers,
  ILeave,
  ICal,
  ISettings,
  IStar,
  IBell,
  ISearch,
  IPlus,
  IArrowUp,
  IArrowDown,
  IArrowRight,
  IChevronLeft,
  IChevronRight,
  IClock,
  IPin,
  IMeeting,
  IDoc,
  ICake,
  PageGreeting,
  KpiCard,
  WorkforceCompositionDonut,
  MiniCalendar,
  type WorkforceCount,
  type NoticeView,
  type ScheduleItem,
  type OnboardingTrackerData,
} from "@/components/curie";
import { TimeOffThisWeekCard } from "@/components/curie/time-off-this-week-card";
import { OnboardingTrackerCard } from "@/components/curie/onboarding-tracker-card";
import { NoticeBoardCard } from "@/components/curie/notice-board-card";
import { TodayScheduleList } from "@/components/curie/today-schedule-list";
import { ComingUpList } from "@/components/curie/coming-up-list";
import type { ComingUpEmployee } from "@/lib/coming-up";

const SAMPLE_NAMES = [
  "Sofia Admin",
  "Lina Okafor",
  "Mei Tanaka",
  "Daniel Reyes",
  "Aoife Walsh",
  "Theo Bennett",
];

const ICON_LIST = [
  { name: "IHome", Component: IHome },
  { name: "IUser", Component: IUser },
  { name: "IUsers", Component: IUsers },
  { name: "ILeave", Component: ILeave },
  { name: "ICal", Component: ICal },
  { name: "ISettings", Component: ISettings },
  { name: "IStar", Component: IStar },
  { name: "IBell", Component: IBell },
  { name: "ISearch", Component: ISearch },
  { name: "IPlus", Component: IPlus },
  { name: "IArrowUp", Component: IArrowUp },
  { name: "IArrowDown", Component: IArrowDown },
  { name: "IArrowRight", Component: IArrowRight },
  { name: "IChevronLeft", Component: IChevronLeft },
  { name: "IChevronRight", Component: IChevronRight },
  { name: "IClock", Component: IClock },
  { name: "IPin", Component: IPin },
  { name: "IMeeting", Component: IMeeting },
  { name: "IDoc", Component: IDoc },
  { name: "ICake", Component: ICake },
];

// Fixtures keyed to Tuesday, May 26, 2026
const PREVIEW_TODAY = new Date(Date.UTC(2026, 4, 26));
const PREVIEW_NOW = new Date(Date.UTC(2026, 4, 26, 9, 45));
const WEEK_START = new Date(Date.UTC(2026, 4, 26));
const WEEK_END = new Date(Date.UTC(2026, 5, 1));

const WORKFORCE: WorkforceCount[] = [
  { label: "Full-time", count: 87, color: "#0B0F1A" },
  { label: "Contract", count: 23, color: "#64748B" },
  { label: "Part-time", count: 12, color: "#CBD5E1" },
  { label: "Intern", count: 6, color: "#2563EB" },
];

const TIMEOFF_ROWS = [
  {
    id: "lr-1",
    name: "Elena Marchetti",
    position: "Engineering · Senior iOS",
    startDate: new Date(Date.UTC(2026, 4, 26)),
    endDate: new Date(Date.UTC(2026, 4, 30)),
    status: "PENDING" as const,
  },
  {
    id: "lr-2",
    name: "Rohan Hejazi",
    position: "Design · Lead Product Designer",
    startDate: new Date(Date.UTC(2026, 4, 28)),
    endDate: new Date(Date.UTC(2026, 4, 29)),
    status: "APPROVED" as const,
  },
  {
    id: "lr-3",
    name: "Júlia Tavares",
    position: "Marketing · Brand Manager",
    startDate: new Date(Date.UTC(2026, 4, 29)),
    endDate: new Date(Date.UTC(2026, 5, 5)),
    status: "PENDING" as const,
  },
];

const ONBOARDING: OnboardingTrackerData = {
  employeeName: "Mei Tanaka",
  position: "Senior Backend Engineer",
  startDate: new Date(Date.UTC(2026, 5, 3)),
  status: "ON_TRACK",
  steps: [
    { ord: 1, label: "Offer signed", status: "DONE", meta: "May 12" },
    { ord: 2, label: "Paperwork", status: "DONE", meta: "May 18" },
    {
      ord: 3,
      label: "Equipment & access",
      status: "CURRENT",
      meta: "In progress",
    },
    { ord: 4, label: "Day-one welcome", status: "UPCOMING", meta: "Jun 3" },
    { ord: 5, label: "30-day review", status: "UPCOMING", meta: "Jul 3" },
  ],
  tags: [
    { label: "Laptop ordered", variant: "tag" },
    { label: "VPN provisioned", variant: "tag" },
    { label: "Slack invite pending", variant: "status-pending" },
  ],
};

const NOTICES: NoticeView[] = [
  {
    id: "an-1",
    author: "Daniel Krause",
    tag: "POLICY",
    createdAt: new Date(PREVIEW_NOW.getTime() - 2 * 60 * 60 * 1000),
    title: "Updated remote-work policy",
    body: "Updated remote-work policy goes into effect **June 1**. Please review the one-pager before your next 1:1.",
  },
  {
    id: "an-2",
    author: "Lina Okafor",
    tag: "TEAM",
    createdAt: new Date(PREVIEW_NOW.getTime() - 26 * 60 * 60 * 1000),
    title: "Welcome Mei Tanaka",
    body: "Welcome **Mei Tanaka** joining Engineering next week. Buddy assignments are in the onboarding sheet.",
  },
  {
    id: "an-3",
    author: "Sofia Vasquez",
    tag: "HR",
    createdAt: new Date(Date.UTC(2026, 4, 24, 10, 0)),
    title: "Q2 engagement survey",
    body: "Q2 engagement survey closes **Friday**. We're at 71% response — let's land above 85% this quarter.",
  },
];

const CALENDAR_EVENTS = [
  new Date(Date.UTC(2026, 4, 2)),
  new Date(Date.UTC(2026, 4, 6)),
  new Date(Date.UTC(2026, 4, 8)),
  new Date(Date.UTC(2026, 4, 14)),
  new Date(Date.UTC(2026, 4, 16)),
  new Date(Date.UTC(2026, 4, 20)),
  new Date(Date.UTC(2026, 4, 26)),
  new Date(Date.UTC(2026, 4, 27)),
  new Date(Date.UTC(2026, 4, 28)),
  new Date(Date.UTC(2026, 4, 30)),
];

const SCHEDULE: ScheduleItem[] = [
  {
    id: "m-1",
    title: "Weekly HR sync",
    scheduledAt: new Date(Date.UTC(2026, 4, 26, 9, 30)),
    durationMinutes: 30,
    participants: [
      { name: "Sofia Vasquez" },
      { name: "Lina Okafor" },
      { name: "Daniel Krause" },
      { name: "Rohan Hejazi" },
      { name: "Júlia Tavares" },
    ],
    badge: { kind: "Meet", label: "Meet" },
  },
  {
    id: "m-2",
    title: "Interview · Mei Tanaka, final round",
    scheduledAt: new Date(Date.UTC(2026, 4, 26, 11, 0)),
    durationMinutes: 45,
    participants: [{ name: "Sofia Vasquez" }, { name: "Rohan Hejazi" }],
    badge: { kind: "Final", label: "Final" },
  },
  {
    id: "m-3",
    title: "1:1 with Rohan",
    scheduledAt: new Date(Date.UTC(2026, 4, 26, 14, 0)),
    durationMinutes: 30,
    participants: [{ name: "Sofia Vasquez" }, { name: "Rohan Hejazi" }],
    badge: { kind: "Room", label: "Room 4B" },
  },
  {
    id: "m-4",
    title: "Q2 hiring plan review",
    scheduledAt: new Date(Date.UTC(2026, 4, 26, 16, 0)),
    durationMinutes: 60,
    participants: [
      { name: "Sofia Vasquez" },
      { name: "Lina Okafor" },
      { name: "Júlia Tavares" },
      { name: "Daniel Krause" },
      { name: "Theo Bennett" },
      { name: "Aoife Walsh" },
    ],
    badge: { kind: "Meet", label: "Meet" },
  },
];

const COMING_UP: ComingUpEmployee[] = [
  {
    id: "e-1",
    firstName: "Aarav",
    lastName: "Mehta",
    dateOfBirth: new Date(Date.UTC(1990, 4, 28)),
    startDate: null,
  },
  {
    id: "e-2",
    firstName: "Lina",
    lastName: "Okafor",
    dateOfBirth: new Date(Date.UTC(1992, 0, 1)),
    startDate: new Date(Date.UTC(2023, 5, 2)),
  },
];

export default function CuriePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-[var(--color-curie-bg)] px-10 py-12 text-[var(--color-curie-fg)] font-[family-name:var(--font-curie-sans)]">
      <div className="mx-auto max-w-5xl space-y-12">
        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-curie-fg-muted)]">
            Dev preview
          </p>
          <h1 className="font-[family-name:var(--font-curie-display)] text-[28px] font-medium leading-tight">
            Curie primitives
          </h1>
          <p className="mt-2 text-[13px] text-[var(--color-curie-fg-secondary)]">
            404s in production. Compare each section against
            <code className="ml-1 font-[family-name:var(--font-curie-mono)] text-[12px]">
              design/overview-mockup.html
            </code>
            .
          </p>
        </header>

        <Section title="PageGreeting">
          <PageGreeting name="Sofia" date={PREVIEW_TODAY} />
        </Section>

        <Section title="KPI cards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Headcount"
              value={128}
              delta={{ dir: "up", label: "+4 this month" }}
              footer={{
                kind: "sparkline",
                points: [22, 20, 21, 18, 17, 15, 14, 11, 8].map((p) => 28 - p),
                tone: "neutral",
              }}
            />
            <KpiCard
              label="Open roles"
              value={7}
              pill={<Pill variant="count">priority</Pill>}
              delta={{ dir: "up", label: "+2 since last week" }}
              footer={{
                kind: "sparkline",
                points: [18, 17, 16, 14, 9, 11, 7, 5].map((p) => 28 - p),
                tone: "brand",
              }}
            />
            <KpiCard
              label="On leave today"
              value={3}
              footer={{
                kind: "stack",
                avatars: [
                  { name: "Elena Marchetti" },
                  { name: "Rohan Hejazi" },
                  { name: "Júlia Tavares" },
                ],
                trailing: "of 128",
              }}
            />
            <KpiCard
              label="Pending approvals"
              value={5}
              unit="/12"
              delta={{ dir: "down", label: "−3 cleared today" }}
              footer={{
                kind: "sparkline",
                points: [8, 10, 9, 12, 14, 16, 18, 21].map((p) => 28 - p),
                tone: "neutral",
              }}
            />
          </div>
        </Section>

        <Section title="WorkforceCompositionDonut">
          <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
            <WorkforceCompositionDonut counts={WORKFORCE} />
          </div>
        </Section>

        <Section title="TimeOffThisWeekCard">
          <TimeOffThisWeekCard
            weekStart={WEEK_START}
            weekEnd={WEEK_END}
            rows={TIMEOFF_ROWS}
          />
        </Section>

        <Section title="OnboardingTrackerCard">
          <OnboardingTrackerCard data={ONBOARDING} />
        </Section>

        <Section title="NoticeBoardCard">
          <NoticeBoardCard notices={NOTICES} now={PREVIEW_NOW} />
        </Section>

        <Section title="MiniCalendar">
          <div className="max-w-[300px]">
            <MiniCalendar
              events={CALENDAR_EVENTS}
              today={PREVIEW_TODAY}
              selected={PREVIEW_TODAY}
              initialMonth={new Date(Date.UTC(2026, 4, 1))}
            />
          </div>
        </Section>

        <Section title="TodayScheduleList">
          <TodayScheduleList
            date={PREVIEW_TODAY}
            now={PREVIEW_NOW}
            items={SCHEDULE}
          />
        </Section>

        <Section title="ComingUpList">
          <div className="rounded-[var(--radius-curie-lg)] bg-[var(--color-curie-surface)] p-6">
            <ComingUpList today={PREVIEW_TODAY} employees={COMING_UP} />
          </div>
        </Section>

        <Section title="Avatar — sizes">
          <div className="flex items-end gap-4">
            <Avatar name="Sofia Admin" size="xs" />
            <Avatar name="Sofia Admin" size="sm" />
            <Avatar name="Sofia Admin" size="md" />
            <Avatar name="Sofia Admin" size="lg" />
          </div>
        </Section>

        <Section title="Avatar — tint palette (a–f)">
          <div className="flex flex-wrap gap-3">
            {(["a", "b", "c", "d", "e", "f"] as const).map((tint) => (
              <div key={tint} className="flex flex-col items-center gap-1">
                <Avatar name={`Sample ${tint.toUpperCase()}`} tint={tint} />
                <span className="font-[family-name:var(--font-curie-mono)] text-[10px] text-[var(--color-curie-fg-muted)]">
                  {tint}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Avatar — hashed (deterministic per name)">
          <div className="flex flex-wrap gap-3">
            {SAMPLE_NAMES.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </div>
        </Section>

        <Section title="AvatarStack">
          <div className="flex flex-col gap-4">
            <AvatarStack names={SAMPLE_NAMES.slice(0, 3)} />
            <AvatarStack names={SAMPLE_NAMES} max={3} />
            <AvatarStack names={SAMPLE_NAMES} size="md" max={4} />
            <AvatarStack names={SAMPLE_NAMES} size="lg" max={2} />
          </div>
        </Section>

        <Section title="Pill — variants">
          <div className="flex flex-wrap gap-2">
            <Pill variant="role">Admin</Pill>
            <Pill variant="tag">Design</Pill>
            <Pill variant="count">7</Pill>
            <Pill variant="status-pending">Pending</Pill>
            <Pill variant="status-approved">Approved</Pill>
            <Pill variant="status-rejected">Rejected</Pill>
            <Pill variant="status-info">Info</Pill>
          </div>
        </Section>

        <Section title="Sparkline">
          <div className="grid max-w-md grid-cols-1 gap-6">
            <div>
              <Label>neutral</Label>
              <Sparkline points={[4, 6, 5, 8, 7, 9, 8, 11]} />
            </div>
            <div>
              <Label>brand</Label>
              <Sparkline points={[3, 5, 4, 6, 7, 6, 8, 9]} tone="brand" />
            </div>
            <div>
              <Label>brand + area</Label>
              <Sparkline
                points={[2, 4, 3, 5, 6, 5, 7, 8]}
                tone="brand"
                area
              />
            </div>
            <div>
              <Label>brand + area (collision check)</Label>
              <Sparkline points={[1, 3, 2, 5, 4, 6]} tone="brand" area />
              <Sparkline points={[6, 4, 5, 2, 3, 1]} tone="brand" area />
            </div>
          </div>
        </Section>

        <Section title="Btn — variants and sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Btn variant="primary" size="md">
              Primary md
            </Btn>
            <Btn variant="primary" size="sm">
              Primary sm
            </Btn>
            <Btn variant="secondary" size="md">
              Secondary md
            </Btn>
            <Btn variant="secondary" size="sm">
              Secondary sm
            </Btn>
            <Btn variant="primary" icon={IPlus}>
              New request
            </Btn>
            <Btn variant="secondary" icon={IDoc}>
              Export report
            </Btn>
            <Btn disabled>Disabled</Btn>
          </div>
        </Section>

        <Section title="IconBtn">
          <div className="flex flex-wrap items-center gap-3">
            <IconBtn icon={IBell} label="Notifications" />
            <IconBtn icon={IBell} label="Notifications (with dot)" dot />
            <IconBtn icon={ISearch} label="Search" />
            <IconBtn icon={ISettings} label="Settings" />
            <IconBtn icon={IChevronLeft} label="Previous" />
            <IconBtn icon={IChevronRight} label="Next" />
          </div>
        </Section>

        <Section title="Icons (20)">
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-8">
            {ICON_LIST.map(({ name, Component }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-curie-md)] border border-[var(--color-curie-border)] bg-[var(--color-curie-surface)] p-3 text-[var(--color-curie-fg-secondary)]"
              >
                <Component width={20} height={20} />
                <span className="font-[family-name:var(--font-curie-mono)] text-[10px]">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-curie-display)] text-[18px] font-medium tracking-[-0.01em]">
        {title}
      </h2>
      <div className="rounded-[var(--radius-curie-lg)] border border-[var(--color-curie-border)] bg-[var(--color-curie-surface)] p-6">
        {children}
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-[family-name:var(--font-curie-mono)] text-[10px] uppercase tracking-[0.08em] text-[var(--color-curie-fg-muted)]">
      {children}
    </div>
  );
}
