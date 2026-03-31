# Step 23 — Responsive Audit + Accessibility

## Prompt for Claude Code

```
Review EVERY page for responsive behavior:

Mobile (<768px): sidebar → sheet, tables → cards, forms single-col,
buttons full-width, modals → bottom sheets, 44px touch targets.

Tablet (768-1024): sidebar toggleable, 2-col grids.

Desktop (>1024): full sidebar, full tables, max-w-[1200px].

Add: hover states (150ms), focus-visible ring (2px apple-blue,
outline-offset 2px), prefers-reduced-motion (disable animations),
4.5:1 contrast, aria-labels on icon buttons, semantic HTML
(nav, main, header, section, article).
```

## Test
- Resize all breakpoints. DevTools: iPhone SE, iPhone 14, iPad, desktop.
- Tab through entire app — focus rings visible.

## Commit
```bash
git add . && git commit -m "step-23: responsive audit and polish"
```
