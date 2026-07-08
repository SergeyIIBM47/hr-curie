# Change Log — Dev Startup & Login Fixes (2026-07-08)

Session log of debugging and fixes applied by Claude Code. All changes are
uncommitted in the working tree alongside the pre-existing rate-limit WIP.

## 1. Fixed: `Cannot find module '.prisma/client/default'` on `npm run dev`

**Root cause:** the generated Prisma client lives in `node_modules/.prisma/client`,
which is wiped by every fresh `npm install`. Nothing regenerated it:
`src/lib/dev-db.ts` runs `prisma migrate deploy` (applies migrations, does not
generate) and there was no postinstall hook.

**Change:**
- `package.json` — added `"postinstall": "prisma generate"` so the client is
  regenerated after every install. Verified `prisma generate` succeeds without
  `.env.local`, so the hook is safe in CI and on fresh clones.

## 2. Fixed: `MissingSecret` after restart

**Root cause:** a Claude test command moved `.env.local` aside and its restore
step never executed (zsh aborted on a read-only `status` variable), then
`dev-db.ts` recreated the file with only `DATABASE_URL` — losing
`NEXTAUTH_SECRET` and `NEXTAUTH_URL`.

**Change:** no code change — `.env.local` restored from the backup, verified
via `/api/auth/session` returning 200.

## 3. Fixed: login failures with no feedback (`CredentialsSignin`)

Browser-driving the login form exposed three bugs:

### 3a. Failed logins looked like successes (core bug)
`login-form.tsx` posted to `/api/auth/callback/credentials` with
`redirect: "manual"`. Every NextAuth response — success **or** failure — is an
opaque redirect in that mode, and the form treated all of them as success: a
wrong password silently bounced `/` → back to `/login` with no error shown.

- `src/app/(auth)/login/login-form.tsx` — replaced the hand-rolled CSRF+fetch
  flow with `signIn("credentials", { redirect: false })` from `next-auth/react`.
  Failed sign-ins now show "Invalid email or password"; rate-limited attempts
  show the lockout message.
- `src/app/(auth)/login/login-form.test.tsx` — rewritten to specify the new
  behavior (error display, lockout message, success navigation).

### 3b. Email case/whitespace sensitivity
`Sofia@Company.COM` could never log in: `prisma.user.findUnique` is
case-sensitive.

- `src/lib/validations/auth.ts` — `loginSchema` email is now
  `.trim().toLowerCase()` before validation. The schema is shared by the form
  (client) and `authorize()` (server), so both are fixed.
- `src/lib/validations/employee.ts` — `createEmployeeSchema.workEmail` gets the
  same normalization so admin-created accounts are stored lowercase and remain
  loginable.

### 3c. Rate limiter split-brain
Next.js bundles each route handler into its own chunk graph, so the in-memory
`Map` in `rate-limit.ts` existed once per chunk — the `/api/auth/rate-limit`
pre-check and `authorize()` disagreed about who was locked out.

- `src/lib/rate-limit.ts` — store moved onto `globalThis` (same pattern as the
  prisma singleton).

## 4. Security review follow-ups (auth code → security-reviewer agent)

Fixed:
- **Next.js 16.2.1 → 16.2.10** (`package.json`) — patch release covering
  middleware/proxy auth-bypass, cache-poisoning, DoS, and SSRF advisories.
- **Timing oracle** (`src/lib/auth.ts`) — unknown emails now run a dummy
  `bcrypt.compare` so response timing no longer reveals whether an account
  exists.
- **Unbounded limiter memory** (`src/lib/rate-limit.ts`) — attempts store is
  capped at 10,000 entries with expired-first eviction.

Reported, not fixed (need product/infra decisions):
- **Lockout DoS (HIGH):** 5 crafted requests lock any known email for 15 min.
  Needs IP-level limiting (WAF), backoff, or CAPTCHA.
- **Per-instance limiter (HIGH):** on Amplify/Lambda each container has its own
  memory — the limiter provides ~no production protection. The `TODO: Redis` in
  `rate-limit.ts` should be a deploy blocker.
- **User-enumeration oracle (MEDIUM):** a 429 from `/api/auth/rate-limit`
  confirms an email exists and was attacked; consider dropping the pre-check
  endpoint and surfacing lockout via the sign-in response only.
- **LOW:** ensure `NODE_ENV=production` is set on Amplify (gates
  `/api/auth/debug`); moderate CVE in prisma's dev-tooling chain
  (`@hono/node-server`) — only fix is a breaking prisma downgrade, dev-only,
  wait for a prisma release.

## Files changed

Modified: `package.json`, `src/app/(auth)/login/login-form.tsx`,
`src/app/(auth)/login/login-form.test.tsx`, `src/lib/auth.ts`,
`src/lib/validations/auth.ts`, `src/lib/validations/auth.test.ts`,
`src/lib/validations/employee.ts`, `src/lib/validations/employee.test.ts`

New: `src/lib/rate-limit.ts` (store + eviction changes on top of existing WIP),
`src/lib/rate-limit.test.ts`

## Verification

- 344/344 unit tests, 9/9 auth integration tests (testcontainers), `tsc` clean,
  eslint clean on changed files.
- Real-browser (Playwright) scenarios: exact credentials → dashboard; uppercase
  email → dashboard; trailing-space email → dashboard; 5 wrong passwords →
  visible error each time; 6th correct attempt → "Too many login attempts. Try
  again in 15 minutes." (lockout message accurate because the store is shared).
- Post-upgrade smoke on Next 16.2.10: wrong password → `?error=CredentialsSignin`,
  uppercase login → session for `Sofia Admin` (ADMIN).
