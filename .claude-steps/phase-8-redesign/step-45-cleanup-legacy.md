# Step 45 — Cleanup Legacy Apple Tokens & Glass Utilities

> Phase 8.7 — see `docs/phase-8-redesign-plan.md` §8.7. Run only after every
> route is migrated (steps 41–44 merged).

## Prompt for Claude Code

```
Strip Apple HIG tokens and Liquid Glass utilities from the codebase now that
every route uses the Cobalt/Frost system.

1. Repo-wide grep:
     rg -e 'apple-(blue|green|orange|red|indigo|purple|pink|teal|yellow)' src/
     rg -e '--color-apple-|--font-size-apple-|--radius-apple-|--shadow-apple-' src/
     rg -e 'glass-(heavy|subtle|button|overlay)\b|glass\b' src/
   Any remaining matches must be migrated before continuing.

2. Delete from src/app/globals.css:
   - Entire blocks: Apple System Colors, Apple Dark Mode System Colors,
     Apple System Grays, Apple Dark Mode Grays, Semantic Surface Colors,
     Semantic Label Colors, Semantic Separator Colors, Semantic Fill Colors,
     Apple HIG Typography Scale (11 --font-size-apple-* triplets),
     Apple Border Radius, Apple Layered Shadows, Apple Spacing,
     Apple Easing Curves, Apple Backdrop Blur.
   - All rules under @layer components: .glass, .glass-heavy, .glass-subtle,
     .glass-button, .glass-overlay (including .dark variants).

3. Keep --color-curie-*, --font-curie-*, --radius-curie-*, and
   --shadow-curie-* as canonical implementation tokens. Do not rename them to
   unprefixed aliases in this phase; avoid a second repo-wide rename.

4. Delete root-level apple-design-system.md and DESIGN_SYSTEM.md.

5. Create docs/design-system.md describing the new system: Cobalt/Frost/Ink
   palette, semantic colors, Fraunces + General Sans pairing, spacing scale,
   radius scale, shadow scale, pill/avatar/button vocabularies. Reference
   design/overview-mockup.html as visual source and document the namespaced
   implementation token names.

6. Update CLAUDE.md:
   - "UI: Tailwind CSS + shadcn/ui, Apple HIG design system" →
     "UI: Tailwind CSS + shadcn/ui, Cobalt/Frost design system"
   - Link to docs/design-system.md instead of apple-design-system.md.

7. Decide on next-themes:
   - If dark mode is on the roadmap: keep, document the decision in
     docs/design-system.md (defer dark-mode tokens to Phase 9).
   - If not: npm uninstall next-themes and remove from any imports.
```

## Test
- `npm run build` green.
- `npm run lint` green.
- `rg -e 'apple-(blue|green|orange|red|indigo|purple|pink|teal|yellow)|--color-apple-|--font-size-apple-|--radius-apple-|--shadow-apple-|glass-(heavy|subtle|button|overlay)\b|glass\b|--color-bg|--color-surface|--color-fg' src/` returns no matches.
- All existing Playwright specs green.

## Commit
```bash
git add src/app/globals.css docs/design-system.md CLAUDE.md && \
  git rm apple-design-system.md DESIGN_SYSTEM.md && \
  git commit -m "step-45: cleanup — remove Apple tokens, glass utilities, rename curie-* to canonical"
```
