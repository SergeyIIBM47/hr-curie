# Step 06 — Dashboard Layout (Sidebar + Top Bar)

## Prompt for Claude Code

```
Create src/app/(dashboard)/layout.tsx (server component):
- requireAuth(), pass session to sidebar/topbar, render structure

Create src/components/layout/sidebar.tsx:
- 260px fixed, full height, z-30, glass-heavy class
- Border-right: 1px solid #C6C6C8
- Top: "HR Curie" text-[17px] font-semibold text-[#007AFF], p-6
- Nav items (each h-[44px] rounded-[8px] mx-3 px-3):
  Overview (LayoutDashboard) → /, My Profile (User) → /profile,
  Employees (Users) → /employees [ADMIN], Leave (CalendarOff) → /leave,
  Calendar (Calendar) → /calendar, Settings (Settings) → /settings [ADMIN]
- Active: text-[#007AFF] bg-[#007AFF]/10 border-l-[3px] border-[#007AFF]
- Inactive: text-[#1D1D1F] hover:bg-[#E5E5EA]
- Admin items: "ADMIN" badge (bg-[#5856D6]/15 text-[#5856D6] text-[11px]
  font-semibold uppercase px-1.5 py-0.5 rounded-[6px])
- Icons: 20x20, stroke-width 1.75
- Bottom: user card (40px avatar circle, name, position, Sign Out button)
- Use usePathname for active detection

Create src/components/layout/topbar.tsx:
- h-[52px] sticky top-0 z-40, glass class, border-bottom separator
- Left: page title (text-[22px] font-bold). Right: 32px avatar
- Desktop: ml-[260px]. Mobile: no margin, shows hamburger

Create src/components/layout/mobile-nav.tsx:
- shadcn Sheet side="left", trigger: Menu icon, visible <md only
- Same nav items as sidebar, width 280px, glass-heavy bg
- Close on nav click

Layout: min-h-screen bg-[#F2F2F7]. Desktop: sidebar fixed + main pl-[260px].
Mobile: no sidebar, hamburger. Content: pt-[52px] max-w-[1200px] mx-auto p-6/p-4.

Create placeholder src/app/(dashboard)/page.tsx: "Dashboard — coming soon"
```

## Test
- Login → sidebar visible, ADMIN badges on Employees/Settings
- Active item highlights blue. Resize <768px → hamburger + sheet.
- Sign Out → login page. Glass blur visible on scroll.

## Commit
```bash
git add . && git commit -m "step-06: dashboard layout"
```
