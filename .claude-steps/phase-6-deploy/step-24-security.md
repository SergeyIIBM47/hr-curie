# Step 24 — Security Hardening

## Prompt for Claude Code

```
Audit every API route:
1. Every route has requireApiAuth() (except health, auth)
2. Write ops require "ADMIN"
3. Profile/avatar verify ownership or ADMIN
4. Self-demotion prevention
5. passwordHash NEVER in ANY response — audit every Prisma query
6. Zod validation on every POST/PUT body
7. Avatar: validate content-type + 5MB max

Login rate limiting:
- In-memory Map: 5 failures per email in 15min → 429
- Clear on success. Comment: use Redis in production.

Security headers in next.config.ts:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Commit
```bash
git add . && git commit -m "step-24: security hardening"
```
