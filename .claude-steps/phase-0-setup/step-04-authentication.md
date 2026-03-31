# Step 04 — Authentication (NextAuth v5)

## Prompt for Claude Code

```
Create src/lib/auth.ts — NextAuth v5 config:
- CredentialsProvider: email + password
- authorize: parse with Zod loginSchema, find user by email,
  bcrypt compare, return {id, email, role, name, image} or null
- JWT callback: store userId + role in token
- Session callback: expose userId + role on session.user
- Pages: { signIn: "/login" }, strategy: "jwt", maxAge: 86400

Create src/types/next-auth.d.ts — module augmentation:
- User: add role: Role
- Session.user: add id: string, role: Role
- JWT: add userId: string, role: Role

Create src/lib/auth-guard.ts:
- requireAuth(requiredRole?) — server components, redirects
- requireApiAuth(requiredRole?) — API routes, returns {session} or {error}

Create src/lib/validations/auth.ts — loginSchema (Zod)

Create src/app/api/auth/[...nextauth]/route.ts — export handlers

Create src/proxy.ts (NEXT.JS 16 — NOT middleware.ts):
- Export named function `proxy` (not `middleware`)
- Public: ["/login"] — redirect /profile if logged in
- Admin-only: ["/employees", "/leave/manage", "/settings"]
- All others require auth
- Matcher: exclude _next/static, _next/image, favicon.ico, api/health

Create src/app/api/health/route.ts — returns {status:"ok", timestamp}
```

## Test
```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
# Visit / → redirects to /login (404 ok)
```

## Commit
```bash
git add . && git commit -m "step-04: authentication setup"
```
