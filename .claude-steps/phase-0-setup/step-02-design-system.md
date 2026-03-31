# Step 02 — Install shadcn/ui + Apple Design System

## Prompt for Claude Code

```
Read the DESIGN_SYSTEM.md file in the project root. Use its exact
color values, typography scale, border radius, shadows, and transitions.

Initialize shadcn/ui with: Style: New York, Base color: Neutral, CSS variables: yes

Install these shadcn/ui components:
button, input, label, card, table, dialog, badge, avatar,
select, textarea, dropdown-menu, sheet, tabs, calendar,
popover, separator, skeleton, toast, sonner, tooltip, switch

Replace tailwind.config.ts with the Apple HIG configuration from
DESIGN_SYSTEM.md. Key values:
- Apple system colors (blue #007AFF, green #34C759, red #FF3B30, etc.)
- Apple 6-step gray scale (gray-1 #8E8E93 through gray-6 #F2F2F7)
- Semantic aliases (surface, label, separator, fill)
- Typography scale (apple-large-title 34px through apple-caption-2 11px)
- Border radius (apple-xs 6px through apple-3xl 22px)
- Layered shadows (apple-sm through apple-xl)
- System font stack (-apple-system, BlinkMacSystemFont, system-ui, etc.)
- Apple easing curve: cubic-bezier(0.25, 0.1, 0.25, 1)
- Backdrop blur values for Liquid Glass

Create src/app/globals.css with:
1. Tailwind imports (@tailwind base, components, utilities)
2. @layer components with Liquid Glass CSS classes:
   .glass — white 72% + blur 20px + saturate 180% + border white/18%
   .glass-heavy — gray-6 85% + blur 40px + saturate 200% + border white/30%
   .glass-subtle — white 88% + blur 10px + saturate 150%
   .glass-button — white 50% + blur 12px + saturate 160%
   .glass-overlay — black 30% + blur 40px + saturate 120%
   Each with .dark variant

Create src/lib/utils.ts:
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Test
- `npm run dev` — page loads with system font
- Inspect: `bg-apple-blue` → #007AFF, `text-apple-body` → 17px

## Commit
```bash
git add . && git commit -m "step-02: apple design system and shadcn-ui"
```
