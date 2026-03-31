# HR Curie — Apple HIG Design System Reference

## Core Principles (Apple HIG)
- Hierarchy: clear visual order, important content dominant
- Harmony: feels native on Apple devices, rounded corners, system fonts
- Consistency: patterns learned in one area transfer everywhere

## Color System — Apple System Colors

### Primary
- apple-blue: #007AFF (primary action, links, active)
- apple-green: #34C759 (success, approved)
- apple-red: #FF3B30 (error, destructive, rejected)
- apple-orange: #FF9500 (warning, pending)
- apple-indigo: #5856D6 (accent, calendar events)
- apple-purple: #AF52DE (tags, categories)
- apple-teal: #5AC8FA (informational)
- apple-yellow: #FFCC00 (highlight)
- apple-pink: #FF2D55 (urgent, badges)

### Gray Scale (Light Mode)
- gray-1: #8E8E93 (tertiary text, disabled)
- gray-2: #AEAEB2 (placeholder text)
- gray-3: #C7C7CC (borders, dividers)
- gray-4: #D1D1D6 (input borders)
- gray-5: #E5E5EA (grouped bg, hover)
- gray-6: #F2F2F7 (page bg, sidebar bg)

### Dark Mode Variants
- blue: #0A84FF, green: #30D158, red: #FF453A
- orange: #FF9F0A, indigo: #5E5CE6, purple: #BF5AF2
- gray-1: #8E8E93, gray-2: #636366, gray-3: #48484A
- gray-4: #3A3A3C, gray-5: #2C2C2E, gray-6: #1C1C1E

### Semantic Colors
- surface: #FFFFFF (cards), surface-secondary: #F2F2F7 (page bg)
- label-primary: #000000, label-secondary: #3C3C43
- separator: rgba(60,60,67,0.29), separator-opaque: #C6C6C8
- fill-primary: rgba(120,120,128,0.2) — input backgrounds

## Typography — System Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, system-ui,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji";
```

### Scale
- apple-large-title: 34px/41px, weight 700, tracking 0.37px
- apple-title-1: 28px/34px, weight 700, tracking 0.36px
- apple-title-2: 22px/28px, weight 700, tracking 0.35px
- apple-title-3: 20px/25px, weight 600, tracking 0.38px
- apple-headline: 17px/22px, weight 600, tracking -0.41px
- apple-body: 17px/22px, weight 400, tracking -0.41px
- apple-callout: 16px/21px, weight 400, tracking -0.32px
- apple-subheadline: 15px/20px, weight 400, tracking -0.24px
- apple-footnote: 13px/18px, weight 400, tracking -0.08px
- apple-caption-1: 12px/16px, weight 400, tracking 0px
- apple-caption-2: 11px/13px, weight 400, tracking 0.07px

## Border Radius
- apple-xs: 6px (badges), apple-sm: 8px (buttons, inputs)
- apple-md: 10px (cards), apple-lg: 12px (large cards)
- apple-xl: 14px (modals), apple-2xl: 18px (panels)

## Shadows (layered for natural depth)
- apple-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)
- apple-md: 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
- apple-lg: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)
- apple-xl: 0 20px 60px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.04)

## Liquid Glass (use sparingly: sidebar, topbar only)
- glass: bg white/72%, backdrop-filter blur(20px) saturate(180%)
- glass-heavy: bg gray-6/85%, backdrop-filter blur(40px) saturate(200%)
- glass-subtle: bg white/88%, backdrop-filter blur(10px) saturate(150%)
- glass-overlay: bg black/30%, backdrop-filter blur(40px) saturate(120%)

## Transitions
- Standard: 250ms cubic-bezier(0.25, 0.1, 0.25, 1)
- Interactive (hover): 150ms same easing
- Spring (modals): 350ms cubic-bezier(0.2, 0.8, 0.2, 1)

## Component Specs
- Buttons: h-[44px] min, rounded-[8px], font-semibold
- Inputs: h-[44px], bg fill-primary, no border, rounded-[8px]
- Cards: bg white, rounded-[10px], shadow-apple-sm, p-5
- Sidebar: 260px wide, glass-heavy, border-right separator-opaque
- Topbar: 52px tall, glass, sticky, border-bottom separator
- Touch targets: 44x44px minimum everywhere
- Icons: 20x20 nav, 16x16 buttons, 48x48 empty states (Lucide React)

## Status Badges
- PENDING: bg-orange/15, text-orange, border-orange/30
- APPROVED: bg-green/15, text-green, border-green/30
- REJECTED: bg-red/15, text-red, border-red/30
- ADMIN: bg-indigo/15, text-indigo
- EMPLOYEE: bg-gray-5, text-gray-1
- All: rounded-[6px] px-2.5 py-0.5 text-[12px] font-semibold uppercase

## Responsive Breakpoints
- Mobile: <768px — sidebar hidden (sheet), single column, cards
- Tablet: 768-1024px — sidebar overlay, 2-column grids
- Desktop: >1024px — sidebar fixed, full tables, max-w-1200px
