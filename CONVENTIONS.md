# HR Curie — Project Conventions

## Stack
- Next.js 16 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui
- Prisma ORM with PostgreSQL
- NextAuth v5 (Auth.js) with credentials + JWT
- Zod for all validation (API + forms)
- SWR for client-side data fetching
- Deployed via AWS Amplify Gen 2

## Architecture Rules
- Server Components by default; add "use client" only when needed
- API routes handle auth via requireApiAuth() helper
- Pages handle auth via requireAuth() helper (server-side redirect)
- Never import prisma in client components
- Never expose passwordHash in any API response
- Always validate inputs with Zod before database operations
- All request APIs are async (params, searchParams, cookies, headers must use await)

## Next.js 16 Specifics
- Use proxy.ts (NOT middleware.ts — renamed in Next.js 16)
- Turbopack is the default bundler — no flags needed
- React Compiler is enabled via reactCompiler: true in next.config.ts
- Export proxy function as named export `proxy` (not `middleware`)

## File Conventions
- Components: PascalCase files (EmployeeCard.tsx)
- Utilities: camelCase files (formatDate.ts)
- Pages: lowercase folders matching URL segments
- Shared types in src/types/index.ts (derived from Prisma when possible)

## Component Guidelines
- Use shadcn/ui primitives, never install additional UI libraries
- Responsive: mobile-first, sidebar collapses at md breakpoint
- Loading states: use Suspense + loading-skeleton.tsx
- Error states: use error.tsx boundary files
- Forms: react-hook-form + zodResolver, never uncontrolled

## API Routes
- Always start with requireApiAuth(optionalRole)
- Parse body with Zod .safeParse(), return 400 on failure
- Use Prisma transactions for multi-table writes
- Return consistent shape: { data } on success, { error, details? } on failure
- Never return 500 with stack traces

## Apple HIG Design Rules
- Follow Apple HIG: filled inputs (gray bg, no border), 44px min touch targets
- System font stack (never import custom fonts)
- Apple blue (#007AFF) as primary accent
- 10px card radius, shadows not borders for depth
- Liquid Glass (glass-heavy) only on sidebar and top bar
- Status badges: PENDING=orange, APPROVED=green, REJECTED=red
- Animations: cubic-bezier(0.25, 0.1, 0.25, 1), 250ms standard, 150ms hover

## Security Checklist
- [ ] Every API route calls requireApiAuth()
- [ ] ADMIN-only routes pass "ADMIN" to requireApiAuth
- [ ] Employee endpoints verify userId ownership for non-admin
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] User.passwordHash excluded from all API responses
- [ ] File uploads validate content type + size (5MB max)
- [ ] Self-demotion prevented (admin can't remove own admin role)

## Commit Messages
Follow conventional commits: feat|fix|chore|docs(scope): description
