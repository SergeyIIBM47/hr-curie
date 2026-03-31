# HR CRM — Apple Human Interface Guidelines Design System

This document replaces the "Design System — macOS Minimalism" section in the
blueprint. It specifies **every visual decision** Claude Code needs to build
the HR CRM UI in strict alignment with Apple's Human Interface Guidelines and
the Liquid Glass design language introduced at WWDC 2025.

---

## 1. Core Design Principles (from Apple HIG)

Every UI decision in this system must pass through three filters:

**Hierarchy** — Establish a clear visual order where controls and interface
elements elevate and distinguish the content beneath them. The most important
information (employee name, leave status, meeting time) must be visually
dominant. Secondary controls recede.

**Harmony** — The interface should feel like it belongs on an Apple device.
Rounded corners, system font stack, familiar patterns, subtle depth through
shadows and translucency — not borders and outlines.

**Consistency** — Every interaction pattern learned in one part of the app
transfers to another. A card that expands on the employee list behaves the
same way on the leave management page. Navigation, spacing, and color
usage are uniform throughout.

---

## 2. Color System — Apple System Colors

Use Apple's official iOS/macOS system color palette. These colors are
designed to work in both light and dark modes with guaranteed accessibility
contrast ratios.

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Apple System Colors (Light Mode) ──────────────────────
        apple: {
          blue:       "#007AFF",   // Primary action, links, active states
          green:      "#34C759",   // Success, approved, positive
          indigo:     "#5856D6",   // Accent for calendar/meeting events
          orange:     "#FF9500",   // Warning, pending states
          pink:       "#FF2D55",   // Urgent, notification badges
          purple:     "#AF52DE",   // Secondary accent (tags, categories)
          red:        "#FF3B30",   // Error, destructive, rejected
          teal:       "#5AC8FA",   // Informational, tooltips
          yellow:     "#FFCC00",   // Highlight, attention
        },

        // ── Apple System Grays (Light Mode) ───────────────────────
        // 6-step gray scale from Apple HIG
        gray: {
          1: "#8E8E93",    // Tertiary text, disabled
          2: "#AEAEB2",    // Placeholder text
          3: "#C7C7CC",    // Borders, dividers
          4: "#D1D1D6",    // Input borders, subtle lines
          5: "#E5E5EA",    // Grouped background, alternating rows
          6: "#F2F2F7",    // Page background, sidebar background
        },

        // ── Dark Mode Variants ────────────────────────────────────
        "apple-dark": {
          blue:       "#0A84FF",
          green:      "#30D158",
          indigo:     "#5E5CE6",
          orange:     "#FF9F0A",
          pink:       "#FF375F",
          purple:     "#BF5AF2",
          red:        "#FF453A",
          teal:       "#64D2FF",
          yellow:     "#FFD60A",
        },

        "gray-dark": {
          1: "#8E8E93",
          2: "#636366",
          3: "#48484A",
          4: "#3A3A3C",
          5: "#2C2C2E",
          6: "#1C1C1E",
        },

        // ── Semantic Aliases ──────────────────────────────────────
        // Use these in components, not raw colors
        surface: {
          DEFAULT:    "#FFFFFF",       // Card background
          secondary:  "#F2F2F7",       // Page background (gray-6)
          tertiary:   "#E5E5EA",       // Grouped/alternating (gray-5)
          elevated:   "#FFFFFF",       // Modal, popover, dropdown
        },
        label: {
          primary:    "#000000",       // Primary text
          secondary:  "#3C3C43",       // Secondary text (60% opacity)
          tertiary:   "#3C3C4399",     // Tertiary text (30% opacity)
          quaternary: "#3C3C4329",     // Minimal text (18% opacity)
        },
        separator: {
          DEFAULT:    "#3C3C4349",     // Standard separator (29% opacity)
          opaque:     "#C6C6C8",      // Non-transparent separator
        },
        fill: {
          primary:    "#78788033",     // 20% opacity — input backgrounds
          secondary:  "#78788028",     // 16% opacity — secondary fills
          tertiary:   "#7676801E",     // 12% opacity — tertiary fills
        },
      },

      // ── Typography ──────────────────────────────────────────────
      fontFamily: {
        // System font stack that resolves to SF Pro on Apple devices,
        // Segoe UI on Windows, Roboto on Android
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
        mono: [
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Fira Mono",
          "Droid Sans Mono",
          "Source Code Pro",
          "monospace",
        ],
      },

      // Apple HIG Typography Scale
      // SF Pro Text (≤19pt) auto-switches to SF Pro Display (≥20pt)
      fontSize: {
        // Display — large titles, hero sections
        "apple-large-title": ["34px", { lineHeight: "41px", fontWeight: "700", letterSpacing: "0.37px" }],
        "apple-title-1":     ["28px", { lineHeight: "34px", fontWeight: "700", letterSpacing: "0.36px" }],
        "apple-title-2":     ["22px", { lineHeight: "28px", fontWeight: "700", letterSpacing: "0.35px" }],
        "apple-title-3":     ["20px", { lineHeight: "25px", fontWeight: "600", letterSpacing: "0.38px" }],

        // Text — body and UI elements
        "apple-headline":    ["17px", { lineHeight: "22px", fontWeight: "600", letterSpacing: "-0.41px" }],
        "apple-body":        ["17px", { lineHeight: "22px", fontWeight: "400", letterSpacing: "-0.41px" }],
        "apple-callout":     ["16px", { lineHeight: "21px", fontWeight: "400", letterSpacing: "-0.32px" }],
        "apple-subheadline": ["15px", { lineHeight: "20px", fontWeight: "400", letterSpacing: "-0.24px" }],
        "apple-footnote":    ["13px", { lineHeight: "18px", fontWeight: "400", letterSpacing: "-0.08px" }],
        "apple-caption-1":   ["12px", { lineHeight: "16px", fontWeight: "400", letterSpacing: "0px" }],
        "apple-caption-2":   ["11px", { lineHeight: "13px", fontWeight: "400", letterSpacing: "0.07px" }],
      },

      // ── Border Radius ───────────────────────────────────────────
      // Apple uses continuous (superellipse) corners — CSS approximates
      // with standard border-radius at these values
      borderRadius: {
        "apple-xs":  "6px",    // Small badges, chips
        "apple-sm":  "8px",    // Buttons, inputs, small cards
        "apple-md":  "10px",   // Standard cards, list items
        "apple-lg":  "12px",   // Large cards, image containers
        "apple-xl":  "14px",   // Modals, dialogs
        "apple-2xl": "18px",   // Large panels, sidebars
        "apple-3xl": "22px",   // Full-screen overlays
      },

      // ── Shadows ─────────────────────────────────────────────────
      // Apple uses layered shadows for natural depth
      boxShadow: {
        "apple-sm":  "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "apple-md":  "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "apple-lg":  "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
        "apple-xl":  "0 20px 60px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.04)",
        // Inset for pressed states / inputs
        "apple-inset": "inset 0 1px 2px rgba(0, 0, 0, 0.06)",
      },

      // ── Spacing ─────────────────────────────────────────────────
      // Apple uses an 8pt grid with specific named increments
      spacing: {
        "apple-sidebar": "260px",
        "apple-topbar":  "52px",
      },

      // ── Transitions ─────────────────────────────────────────────
      transitionTimingFunction: {
        // Apple's standard easing curve
        "apple": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        // Spring-like for interactive elements
        "apple-spring": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        "apple-fast":   "150ms",
        "apple-normal": "250ms",
        "apple-slow":   "350ms",
      },

      // ── Backdrop Blur (Liquid Glass) ────────────────────────────
      backdropBlur: {
        "apple-sm":     "10px",
        "apple-md":     "20px",    // Standard toolbar/sidebar blur
        "apple-lg":     "40px",    // Modal/overlay blur
        "apple-ultra":  "80px",    // Full vibrancy
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 3. Liquid Glass Effect — CSS Implementation

Apple's WWDC 2025 Liquid Glass language brings translucent, refractive
surfaces to the interface. For the web, we implement this using
`backdrop-filter` and layered pseudo-elements.

### Usage Guidelines

Use Liquid Glass **sparingly** for key structural elements:
- Sidebar navigation background
- Top bar / header
- Modal overlays
- Floating action buttons

Do **not** apply Liquid Glass to:
- Every card (it reduces readability)
- Form inputs (use solid backgrounds)
- Data tables (content must be crisp)

### Glass Component Classes

```css
/* src/app/globals.css — add after Tailwind imports */

@layer components {
  /* ── Standard Glass Surface ──────────────────────────────── */
  .glass {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .dark .glass {
    background: rgba(28, 28, 30, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* ── Heavy Glass (sidebar, top bar) ──────────────────────── */
  .glass-heavy {
    background: rgba(242, 242, 247, 0.85);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dark .glass-heavy {
    background: rgba(28, 28, 30, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  /* ── Subtle Glass (cards that need readability) ──────────── */
  .glass-subtle {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
    border: 1px solid rgba(209, 209, 214, 0.4);
  }

  /* ── Glass Button ────────────────────────────────────────── */
  .glass-button {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 250ms cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .glass-button:hover {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* ── Modal Overlay ───────────────────────────────────────── */
  .glass-overlay {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(40px) saturate(120%);
    -webkit-backdrop-filter: blur(40px) saturate(120%);
  }
}
```

---

## 4. Typography Rules

### Mapping Apple Text Styles to UI Elements

| UI Element               | Apple Text Style  | CSS Class                | Weight |
|--------------------------|-------------------|--------------------------|--------|
| Page title               | Title 1           | `text-apple-title-1`     | Bold   |
| Section heading          | Title 3           | `text-apple-title-3`     | Semi   |
| Card title               | Headline          | `text-apple-headline`    | Semi   |
| Body text, descriptions  | Body              | `text-apple-body`        | Regular|
| Form labels              | Callout           | `text-apple-callout`     | Regular|
| Secondary info           | Subheadline       | `text-apple-subheadline` | Regular|
| Table headers            | Footnote          | `text-apple-footnote`    | Semi   |
| Badges, timestamps       | Caption 1         | `text-apple-caption-1`   | Regular|
| Fine print, legal        | Caption 2         | `text-apple-caption-2`   | Regular|

### Typography Don'ts

- Never use more than 2 font weights on a single screen (Regular + Semibold)
- Bold (700) is reserved for Large Title and Title 1 only
- Never use ALL CAPS for body text — only for short labels (badges, status)
- Minimum body text size: 17px (Apple's accessibility recommendation)
- Minimum touch-target associated text: 15px

---

## 5. Component Specifications

### 5.1 Sidebar Navigation

```
┌──────────────────────────┐
│  ●  Logo / App Name      │  ← 24px padding top
│                          │
│  ┌──────────────────────┐│
│  │ 🏠  Overview         ││  ← Active: apple-blue bg (10% opacity)
│  └──────────────────────┘│     with left 3px accent bar
│  │ 👤  My Profile        │  ← Inactive: transparent bg
│  │ 👥  Employees    ADM  │  ← Badge for admin-only items
│  │ 🏖️  Leave            │
│  │ 📅  Calendar          │
│  │ ⚙️  Settings    ADM  │
│                          │
│  ┌──────────────────────┐│
│  │ 😊  Sofia Admin       ││  ← Bottom: user card with avatar
│  │  HR Manager           ││
│  │  🚪 Sign Out          ││
│  └──────────────────────┘│
└──────────────────────────┘

Width:           260px fixed (collapses to sheet on mobile < 768px)
Background:      glass-heavy (#F2F2F7 at 85% opacity + blur 40px)
Nav items:       44px height (Apple minimum touch target)
Active item:     apple-blue text + left 3px border + 10% blue background
Inactive item:   gray-1 icon, label-primary text
Hover:           gray-5 background
Border right:    1px separator-opaque
Icon size:       20×20px (use Lucide icons matching SF Symbols style)
Item padding:    12px horizontal, 10px vertical
Item radius:     apple-sm (8px)
```

### 5.2 Top Bar

```
┌────────────────────────────────────────────────────┐
│  📄 Employees              🔍 Search...  🔔  👤   │
│     List of all employees                          │
└────────────────────────────────────────────────────┘

Height:          52px
Background:      glass (white at 72% + blur 20px)
Position:        sticky top-0, z-40
Left:            Page title (apple-title-2) + description (apple-footnote, gray-1)
Right:           Search input + notification bell + user avatar
Border bottom:   1px separator (semi-transparent)
```

### 5.3 Cards

```
┌──────────────────────────────────────────┐
│  Employee Card                           │
│  ┌──────┐                                │
│  │Avatar│  John Doe           ADMIN ●    │  ← Badge: apple-xs radius
│  │ 40px │  j.doe@company.com             │
│  └──────┘  Frontend Developer            │
│                                          │
│  📅 Started 2023  📍 Prague, CZ          │
└──────────────────────────────────────────┘

Background:      surface (white)
Border:          none (use shadow for depth, not borders)
Shadow:          apple-sm
Border-radius:   apple-md (10px)
Padding:         16px (mobile) / 20px (desktop)
Hover:           shadow-apple-md + translateY(-1px)
Transition:      250ms apple easing
Avatar:          40px circle, gray-5 border
Gap:             12px between avatar and text
```

### 5.4 Buttons

```
Primary:     bg-apple-blue, text-white, rounded-apple-sm
             hover: brightness-110%, active: brightness-95%
             height: 44px (Apple minimum touch target)
             padding: 0 20px
             font: apple-body weight 600

Secondary:   bg-fill-primary (20% gray), text-label-primary, rounded-apple-sm
             hover: bg-fill-secondary
             same dimensions as primary

Destructive: bg-apple-red, text-white, rounded-apple-sm
             used only for: delete, remove, reject

Ghost:       bg-transparent, text-apple-blue
             hover: bg-apple-blue/10
             used for: cancel, close, less important actions

Icon Button: 44×44px, rounded-full, bg-transparent
             hover: bg-fill-primary
             icon: 20×20px, gray-1 color
```

### 5.5 Form Inputs

```
┌──────────────────────────────────┐
│  First Name                      │  ← Label: apple-callout, label-secondary
│  ┌──────────────────────────────┐│
│  │  John                        ││  ← apple-body, label-primary
│  └──────────────────────────────┘│
│                                  │
│  Work Email *                    │
│  ┌──────────────────────────────┐│
│  │  john@company.com            ││  ← Focus: 2px apple-blue ring
│  └──────────────────────────────┘│
│  ⚠️ This email is already in use │  ← Error: apple-footnote, apple-red
└──────────────────────────────────┘

Height:          44px (Apple touch target minimum)
Background:      fill-primary (rgba(120, 120, 128, 0.12)) — NOT white
Border:          none by default (Apple style uses filled inputs)
Focus:           2px ring in apple-blue, background shifts to white
Border-radius:   apple-sm (8px)
Padding:         12px horizontal
Label:           apple-callout, label-secondary, 6px margin-bottom
Error text:      apple-footnote, apple-red, 4px margin-top
Placeholder:     gray-2 color
Gap between fields: 20px
```

### 5.6 Status Badges

```
PENDING    →  bg-apple-orange/15, text-apple-orange, border-apple-orange/30
APPROVED   →  bg-apple-green/15, text-apple-green, border-apple-green/30
REJECTED   →  bg-apple-red/15, text-apple-red, border-apple-red/30
ADMIN      →  bg-apple-indigo/15, text-apple-indigo, border-apple-indigo/30
EMPLOYEE   →  bg-gray-5, text-gray-1

Height:       24px
Padding:      4px 10px
Radius:       apple-xs (6px)
Font:         apple-caption-1, weight 600, uppercase, letter-spacing 0.5px
```

### 5.7 Tables (Employee List)

```
┌─────────────────────────────────────────────────────────────┐
│  NAME ▲          EMAIL              ROLE      DEPARTMENT    │  ← Header
├─────────────────────────────────────────────────────────────┤
│  ● John Doe      john@co.com        ADMIN     Engineering  │  ← Row
│  ● Jane Smith    jane@co.com        EMPLOYEE  Design       │
│  ● Bob Wilson    bob@co.com         EMPLOYEE  Marketing    │  ← Alternating
└─────────────────────────────────────────────────────────────┘

Header:          apple-footnote, weight 600, uppercase, gray-1
                 bg-surface-secondary, sticky
Row height:      52px (contains 40px avatar + padding)
Row hover:       bg-gray-6
Alternating:     NO alternating colors (Apple style uses uniform white)
Separator:       1px separator between rows
Cell padding:    16px horizontal
Border-radius:   apple-md (10px) on the outer table container
Shadow:          apple-sm on container

On mobile (< 768px): transform into stacked cards
```

### 5.8 Modals / Dialogs

```
┌─────────────────────────────────────────────┐
│  ×                                          │
│           Schedule Meeting                  │  ← apple-title-3, centered
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  Form content here                      ││
│  └─────────────────────────────────────────┘│
│                                             │
│       [ Cancel ]        [ Schedule ]        │  ← Ghost + Primary buttons
└─────────────────────────────────────────────┘

Overlay:         glass-overlay (black 30% + blur 40px)
Container:       surface (white), rounded-apple-xl (14px)
Shadow:          apple-xl
Max-width:       480px (small), 600px (medium), 840px (large)
Padding:         24px
Animation:       scale from 95% to 100% + opacity, 250ms apple easing
Close button:    top-right, 44×44px ghost icon button
```

### 5.9 Toast Notifications

```
Position:        bottom-center, 24px from bottom
Background:      glass (white 72% + blur 20px)
Shadow:          apple-lg
Radius:          apple-md (10px)
Padding:         12px 16px
Icon:            20px, contextual color (green=success, red=error)
Text:            apple-body
Duration:        4 seconds, then fade out (350ms)
```

---

## 6. Page Layout Specifications

### 6.1 Dashboard (Authenticated)

```
┌────────────────────────────────────────────────────────────┐
│         │                                                  │
│         │  ┌──────────────── Top Bar ──────────────────┐   │
│         │  └──────────────────────────────────────────-─┘   │
│  Side-  │                                                  │
│  bar    │  ┌──────────────────────────────────────────┐   │
│  260px  │  │  Page Content Area                       │   │
│         │  │  max-width: 1200px                       │   │
│         │  │  padding: 24px (desktop) / 16px (mobile) │   │
│         │  │                                          │   │
│         │  └──────────────────────────────────────────┘   │
│         │                                                  │
└────────────────────────────────────────────────────────────┘

Page background:   surface-secondary (#F2F2F7)
Content area:      no background (cards provide white surfaces)
Content max-width: 1200px, centered
Responsive:        sidebar collapses at 768px breakpoint
Mobile padding:    16px
Desktop padding:   24px
Gap between cards: 16px (mobile) / 20px (desktop)
```

### 6.2 Login Page

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           Background: surface-secondary (#F2F2F7)       │
│                                                         │
│              ┌────────────────────────┐                 │
│              │                        │                 │
│              │     🍎  HR Portal      │  ← App name    │
│              │                        │                 │
│              │   ┌────────────────┐   │                 │
│              │   │ Email          │   │  ← Filled input│
│              │   └────────────────┘   │                 │
│              │   ┌────────────────┐   │                 │
│              │   │ Password    👁️ │   │  ← Show/hide  │
│              │   └────────────────┘   │                 │
│              │                        │                 │
│              │   [ Sign In ─────── ]  │  ← Full-width  │
│              │                        │                 │
│              └────────────────────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

Card:            surface (white), rounded-apple-xl, shadow-apple-lg
Card width:      400px max, 90vw on mobile
Card padding:    32px (desktop), 24px (mobile)
Centered:        both axes (flex items-center justify-center min-h-screen)
Logo:            24px icon + apple-title-2 text, apple-blue color
Input gap:       16px between fields
Button:          full-width, 44px height, apple-blue, rounded-apple-sm
```

---

## 7. Iconography

Use **Lucide React** icons, which are the closest open-source match to
Apple's SF Symbols in terms of stroke weight and visual style.

### Icon Rules

```
Size in navigation:    20×20px, stroke-width 1.75
Size in buttons:       16×16px, stroke-width 2
Size in empty states:  48×48px, stroke-width 1.5
Color:                 gray-1 (default), apple-blue (active), inherit (in buttons)
Alignment:             vertically centered with text baseline
```

### Recommended Icon Mapping

| Feature              | Lucide Icon          | SF Symbol Equivalent      |
|----------------------|----------------------|---------------------------|
| Dashboard/Overview   | `LayoutDashboard`    | `square.grid.2x2`        |
| Profile              | `User`               | `person.crop.circle`     |
| Employees            | `Users`              | `person.2`               |
| Leave/Time Off       | `CalendarOff`        | `calendar.badge.minus`   |
| Calendar             | `Calendar`           | `calendar`               |
| Settings             | `Settings`           | `gearshape`              |
| Search               | `Search`             | `magnifyingglass`        |
| Add/Create           | `Plus`               | `plus`                   |
| Edit                 | `Pencil`             | `pencil`                 |
| Delete               | `Trash2`             | `trash`                  |
| Approve/Check        | `Check`              | `checkmark`              |
| Reject/Close         | `X`                  | `xmark`                  |
| Sign Out             | `LogOut`             | `rectangle.portrait.and.arrow.right` |
| Upload               | `Upload`             | `arrow.up.circle`        |
| Notification         | `Bell`               | `bell`                   |
| Meeting              | `Video`              | `video`                  |
| Filter               | `SlidersHorizontal`  | `line.3.horizontal.decrease.circle` |

---

## 8. Animation & Motion

Apple's motion design follows the principle: **animations should feel
natural, purposeful, and never delay the user.**

### Easing Curves

```css
/* Standard — most transitions */
transition: all 250ms cubic-bezier(0.25, 0.1, 0.25, 1);

/* Interactive — hover, press, toggle */
transition: all 150ms cubic-bezier(0.25, 0.1, 0.25, 1);

/* Spring — modals, sheets, expanding elements */
transition: all 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
```

### When to Animate

| Interaction          | Animation                                    | Duration |
|----------------------|----------------------------------------------|----------|
| Page transition      | Fade in content, 0 → 1 opacity              | 250ms    |
| Card hover           | shadow-sm → shadow-md + translateY(-1px)     | 150ms    |
| Button press         | scale(0.98) + brightness(0.95)               | 100ms    |
| Modal open           | scale(0.95→1) + opacity(0→1) + overlay fade | 250ms    |
| Modal close          | scale(1→0.95) + opacity(1→0)                | 200ms    |
| Toast appear         | translateY(20px→0) + opacity(0→1)            | 250ms    |
| Toast dismiss        | opacity(1→0)                                 | 350ms    |
| Sidebar collapse     | width 260px → 0 (with content fade)          | 250ms    |
| Mobile sheet slide   | translateY(100%→0)                            | 300ms    |
| Status badge change  | scale pulse (1→1.1→1)                        | 300ms    |
| Loading skeleton     | opacity pulse (0.4→1→0.4)                    | 1500ms   |

### What Not to Animate

- Do NOT animate data table rows appearing
- Do NOT add bounce/elastic easing (not Apple-like)
- Do NOT animate color changes on text
- Do NOT use delays longer than 100ms
- Do NOT animate layout shifts (use CSS containment)

---

## 9. Responsive Breakpoints

Following Apple's device-width approach:

| Breakpoint | Width    | Behavior                                         |
|------------|----------|--------------------------------------------------|
| Mobile     | < 768px  | Sidebar hidden (sheet), single column, cards      |
| Tablet     | 768–1024 | Sidebar overlay, 2-column grid where applicable   |
| Desktop    | > 1024px | Sidebar fixed, full table views, max-w-1200px     |

### Mobile Adaptations

- Sidebar → full-height sheet from left (glass-heavy background)
- Tables → stack into cards (each row becomes a card)
- Forms → single column, full-width inputs
- Modals → full-screen sheets sliding from bottom
- Top bar → hamburger menu + page title only
- Buttons → full-width in mobile forms
- Touch targets: minimum 44×44px everywhere

---

## 10. Accessibility Requirements (from Apple HIG)

- **Contrast**: minimum 4.5:1 for body text, 3:1 for large text
- **Touch targets**: minimum 44×44pt for all interactive elements
- **Focus indicators**: 2px apple-blue ring (outline-offset: 2px)
- **Reduced motion**: respect `prefers-reduced-motion` media query
  — disable all transitions, use instant state changes
- **Dark mode**: support `prefers-color-scheme: dark` using the
  dark variant colors specified in the color system
- **Font scaling**: use relative units (rem) so text scales with
  browser zoom — the px values above are reference sizes at 1x

---

## 11. Claude Code Prompt — Design Implementation

Use this prompt when starting the UI phase to ensure Claude Code
follows the Apple design system:

```
"Follow the Apple HIG Design System document strictly. Use the exact
Tailwind config provided — do not invent new colors or spacing values.
Every interactive element must be minimum 44px tall. Use the system
font stack (never import custom fonts). Apply Liquid Glass (glass-heavy
class) only to the sidebar and top bar. Cards use white backgrounds
with apple-sm shadow, not glass. Form inputs use filled style
(fill-primary background, no border, 8px radius). Status badges use
the exact color mapping: PENDING=orange, APPROVED=green, REJECTED=red.
Animations use the apple easing curve (cubic-bezier 0.25, 0.1, 0.25, 1)
at 250ms for standard transitions and 150ms for hover states. On mobile
below 768px, sidebar becomes a sheet and tables become stacked cards."
```
