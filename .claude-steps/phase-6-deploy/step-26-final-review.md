# Step 26 — Final Review + README

## Prompt for Claude Code

```
Create README.md:
- Project: "HR Curie — Lightweight HR CRM"
- Features list (employee mgmt, leave, calendar, RBAC)
- Tech stack table
- Prerequisites: Node 20+, Docker (for Testcontainers)
- Local dev setup: clone → npm install → npm run dev
  (auto-starts PostgreSQL via Testcontainers) →
  npx prisma migrate dev → npx prisma db seed
- Environment variables table
- Project structure overview
- Scripts: dev, build, lint, db:migrate, db:seed, db:studio
- Deployment: link to DEPLOYMENT.md
- Default credentials: sofia@company.com / qwerty123#
  ⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN

Final checks — run and fix any issues:
- npx tsc --noEmit → zero TypeScript errors
- npm run lint → zero ESLint errors
- npm run build → builds successfully
- Every page renders without console errors
- Full E2E flow: login → create employee → request leave →
  approve leave → schedule meeting → view calendar
```

## Commit
```bash
git add . && git commit -m "step-26: final review and readme"
git tag v0.1.0 -m "MVP release"
```

## 🎉 Done!
