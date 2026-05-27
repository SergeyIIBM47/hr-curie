# Phase 8 Redesign Steps

These files are execution prompts for `docs/phase-8-redesign-plan.md`.

Canonical visual reference:
- `design/overview-mockup.html`

Consistency rules:
- Use namespaced implementation tokens: `--color-curie-*`, `--font-curie-*`,
  `--radius-curie-*`, `--shadow-curie-*`.
- Treat `design/overview-mockup.html` as a 1440px desktop reference. Responsive
  behavior is specified in the step files and the master plan.
- Rail content uses Next parallel route slots under `src/app/(dashboard)/@rail`;
  do not use React context to push rail content from a page into its parent
  server layout.
- Visual parity tests freeze time to `2026-05-26T09:35:00`.
