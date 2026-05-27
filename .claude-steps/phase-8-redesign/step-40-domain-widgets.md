# Step 40 — Domain Widgets (KPI / Donut / TimeOff / Onboarding / Notice / MiniCalendar / Schedule / ComingUp / Greeting)

> Phase 8.4 — see `docs/phase-8-redesign-plan.md` §8.4.

## Prompt for Claude Code

```
Create nine data-aware widgets under src/components/curie/ that compose Step 38
primitives and consume Step 39 models.

page-greeting.tsx (server) — props { name, date: Date }
  Renders: date overline (Tue · May 26 — mono, uppercase, muted), then
  "Good morning, <em>Name</em>." in --font-curie-display 56px italic name.

kpi-card.tsx (server) — props
  { label: string; value: number|string; unit?: string; pill?: ReactNode;
    delta?: { dir:"up"|"down"|"flat"; label:string };
    footer: { kind:"sparkline"; points:number[]; tone:"neutral"|"brand" }
          | { kind:"stack"; avatars: AvatarProps[]; trailing?: string }
          | { kind:"text"; text:string } }
  44px Fraunces value, 11px uppercase muted label, optional Cobalt pill.

workforce-composition-donut.tsx (server) — props { counts: { label,count,color }[] }
  Uses src/lib/donut.ts. SVG viewBox 0 0 36 36, r=15.9, stroke-width=3.
  4 slices using palette: Ink #0B0F1A / Slate #64748B / Ash #CBD5E1 /
  Cobalt #2563EB (last slice always Cobalt for brand presence).
  Center: total in --font-curie-display 36px + "Total people" cap.

time-off-this-week-card.tsx (server) — fetches LeaveRequest where
  startDate <= weekEnd AND endDate >= weekStart, join Employee.
  Row: md Avatar + name/position + "May 26 → May 30" mono + status Pill.

onboarding-tracker-card.tsx (server) — fetches OnboardingPlan + steps.
  Horizontal stepper: tracker-step done (filled Ink dot ✓), current (Cobalt
  outlined dot with number), upcoming (gray outlined dot). Connecting line
  between steps becomes Ink for completed segments.

notice-board-card.tsx (server) — fetches latest 3 announcements + author.
  Row: 8px unread-dot (Cobalt) on most recent only, md Avatar (name-hash tint),
  author bold + tag Pill + relative time mono, then body with <strong>
  emphasis preserved.

mini-calendar.tsx ("use client") — props { events: Date[]; selected?: Date }
  Week-starts-Monday grid. Cell states: muted (out-of-month), has-event (dot
  below number), today (Cobalt underline), selected (Ink filled bg).
  Internal state for prev/next month nav. Selectable days are <button>s with
  accessible labels; out-of-month inert days may be plain text.

today-schedule-list.tsx (server) — fetches Meeting where
  scheduledAt::date = today, with participants.
  Card: time mono + clock icon, title 15px Fraunces, footer avatar-stack
  + meeting-type Pill (Meet / Final / Room 4B from Meeting.notes/location).
  Add .now styling (left Ink bar + shadow-soft) when scheduledAt <= now <
  scheduledAt + durationMinutes.

coming-up-list.tsx (server) — uses src/lib/coming-up.ts (pure function,
  unit-tested) to find Employee.dateOfBirth and Employee.startDate
  anniversaries falling in next 14 days.
  Row: ICake icon for birthday, IStar for anniversary; name + label
  ("Birthday" or "N years") + mono date.

src/lib/coming-up.ts — exports nextBirthdays(employees, today, windowDays)
  and nextAnniversaries(...). Handles Feb-29 (use Mar-1 in non-leap) and
  year-boundary (Dec→Jan window). Unit-tested in src/lib/coming-up.test.ts.

All widgets render to /curie-preview with fixture data for visual review.
Visual-preview fixtures should use Tuesday, May 26, 2026 so screenshots match
design/overview-mockup.html.
```

## Test
- `npm run test:run -- src/lib/coming-up src/lib/donut src/components/curie`
- Visit /curie-preview; verify each widget renders.

## Commit
```bash
git add src/components/curie src/lib/coming-up.ts src/lib/coming-up.test.ts \
  src/app/\(dev\)/curie-preview && \
  git commit -m "step-40: domain widgets for overview redesign"
```
