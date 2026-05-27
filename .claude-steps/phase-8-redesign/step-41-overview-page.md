# Step 41 — Rebuild `/` Overview Page

> Phase 8.5 — see `docs/phase-8-redesign-plan.md` §8.5.

## Prompt for Claude Code

```
Rewrite src/app/(dashboard)/page.tsx and add src/app/(dashboard)/page.queries.ts
plus src/app/(dashboard)/@rail/page.tsx so the admin / overview matches
design/overview-mockup.html exactly at 1440px.

page.queries.ts (server-only):
  Export fetchAdminOverview(session) and fetchEmployeeOverview(session) that
  each return a typed view-model with all data needed by the page in a single
  Promise.all. Pull:
    - Headcount (current + 8-week sparkline series via groupBy createdAt::date)
    - Open roles (status=OPEN count + priority flag for pill)
    - On leave today (count + first 3 employees with avatars)
    - Pending approvals (status=PENDING count + total this month, 7-day series)
    - Workforce composition counts by employmentTypeId
    - This-week leave requests (overlap Mon→Sun current week)
    - Active OnboardingPlan + steps + employee
    - Latest 3 announcements + authors
    - Month events: union of Meeting.scheduledAt + LeaveRequest day-ranges
    - Today's meetings + participants
    - Coming up: birthdays + anniversaries in next 14 days

page.tsx (server component):
  ADMIN branch composition:
    <PageGreeting name={firstName} date={today}/>
    <ActionsRow>
      <Btn variant="secondary" icon={IDoc}>Export report</Btn>
      <Btn variant="primary" icon={IPlus}>New request</Btn>
    </ActionsRow>
    <KpiRow>
      <KpiCard label="Headcount" value={hc} delta footer={sparkline}/>
      <KpiCard label="Open roles" pill="priority" value={open}
               delta footer={brandSparkline}/>
      <KpiCard label="On leave today" value={onLeave}
               footer={{kind:"stack",avatars,trailing:`of ${total}`}}/>
      <KpiCard label="Pending approvals" value={pending} unit={`/${pendingTotal}`}
               delta footer={sparkline}/>
    </KpiRow>
    <Grid2>
      <WorkforceCompositionDonut counts={counts}/>
      <TimeOffThisWeekCard items={timeOff}/>
    </Grid2>
    <Grid2>
      <OnboardingTrackerCard plan={plan}/>
      <NoticeBoardCard announcements={notices}/>
    </Grid2>

  Right rail (render in src/app/(dashboard)/@rail/page.tsx via Next parallel
  route slot; do not use React context to push content from page to layout):
    <MiniCalendar events={monthEvents} selected={today}/>
    <TodayScheduleList items={today}/>
    <ComingUpList items={comingUp}/>

  EMPLOYEE branch:
    <PageGreeting name={firstName} date={today}/>
    <QuickActions> (Request Leave / Calendar / My Profile)
    <Grid2>
      <MyLeaveCard/>
      <UpcomingMeetingsCard/>
    </Grid2>
  Rail: <MiniCalendar events={myEvents}/> + <TodayScheduleList items={myToday}/>

page.queries.ts should expose shared date-window/data-shaping helpers so
page.tsx and @rail/page.tsx use identical ranges without duplicating logic.

Responsive content:
  - KPI row: 4 columns desktop, 2 tablet, 1 mobile
  - Grid2 collapses to one column below 1024px
  - Header actions wrap under greeting on mobile

Visual tests freeze browser time to 2026-05-26T09:35:00 so date, calendar,
"Now" schedule state, birthdays, and anniversaries match the static mockup.

Update tests/e2e/flows/phase-0-redesign.spec.ts or add
tests/e2e/flows/phase-8-overview.spec.ts:
  - Assert KPI labels render
  - Assert donut SVG has 4 slices with combined dasharray ≈ 100
  - Assert mini-calendar highlights today
  - Capture test-results/phase-8.5/overview-{admin,employee}-1440.png
```

## Test
- Log in as `sofia@company.com` / `qwerty123#`, eyeball at 1440×900 against mockup.
- `npx playwright test --project=chromium tests/e2e/flows/phase-8-overview.spec.ts`

## Commit
```bash
git add src/app/\(dashboard\)/page.tsx src/app/\(dashboard\)/page.queries.ts \
  src/app/\(dashboard\)/@rail/page.tsx \
  tests/e2e/flows/phase-8-overview.spec.ts && \
  git commit -m "step-41: rebuild / overview to match design/overview-mockup.html"
```
