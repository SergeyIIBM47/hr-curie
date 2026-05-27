# Step 38 — Primitive Components Library

> Phase 8.2 — see `docs/phase-8-redesign-plan.md` §8.2.

## Prompt for Claude Code

```
Create src/components/curie/ with these primitives (server components by default,
add "use client" only when interactivity is needed):

avatar.tsx        — sizes xs(20)/sm(28)/md(36)/lg(44), tint variants a–f,
                    initials from name. Tint palette per mockup lines 525–530:
                    a #DBE5F4/#0B0F1A, b #D2DAE8/#1E293B, c #E3E7F1/#1E3A8A,
                    d #D8E2F0/#1F2937, e #DCE2EE/#1E3A8A, f #D6DEEA/#1F2937.
                    Pick tint by hashing firstName+lastName (deterministic).
avatar-stack.tsx  — overlapping group, -8px margin-left; renders `+N` chip
                    when truncated. Each avatar gets 2px white border.
pill.tsx          — variants: role | tag | count | status-pending |
                    status-approved | status-rejected | status-info.
                    22px tall, font 11px, --radius-curie-pill. count uses
                    --font-curie-mono + Cobalt-soft bg.
sparkline.tsx     — pure SVG; props { points: number[]; tone: "neutral"|"brand";
                    area?: boolean }. viewBox 0 0 100 28. Map points to polyline.
                    For tone=brand with area=true, add unique linearGradient id
                    using React.useId() to prevent collisions.
btn.tsx           — variants primary (cobalt pill, white fg) and secondary
                    (white bg, border, ink fg). Sizes sm(32) and md(40).
                    Optional leading icon. Pill radius.
icon-btn.tsx      — 36px circle, optional dot indicator (position absolute
                    top 8px right 9px, 8px Cobalt circle with 2px Frost ring).
icons.tsx         — Export 20 inline SVG components from mockup lines 749–768:
                    IHome IUser IUsers ILeave ICal ISettings IStar IBell
                    ISearch IPlus IArrowUp IArrowDown IArrowRight
                    IChevronLeft IChevronRight IClock IPin IMeeting IDoc ICake.
                    All default width=16 height=16 stroke=currentColor
                    stroke-width=1.5 fill=none stroke-linecap=round
                    stroke-linejoin=round.
index.ts          — barrel re-export.

src/lib/name-hash.ts — deterministic tint-letter picker, unit-tested.
src/lib/donut.ts     — computeSlices(counts:number[]) returning dasharray/offset
                       arrays summing to 100, unit-tested.

Dev-only preview route: src/app/(dev)/curie-preview/page.tsx that mounts every
primitive variant. Gate with env check (404 in production).

Vitest unit + snapshot tests under src/components/curie/*.test.tsx.
Use only namespaced implementation tokens (--color-curie-*, --font-curie-*,
--radius-curie-*, --shadow-curie-*). Do not copy unprefixed mockup aliases like
--color-bg into component code.
```

## Test
- `npm run test:run -- src/components/curie src/lib/name-hash src/lib/donut`
- Visit /curie-preview in dev; eyeball variants.

## Commit
```bash
git add src/components/curie src/lib/name-hash.ts src/lib/donut.ts \
  src/app/\(dev\)/curie-preview && \
  git commit -m "step-38: curie primitives — Avatar, Pill, Sparkline, Btn, IconBtn, Icons"
```
