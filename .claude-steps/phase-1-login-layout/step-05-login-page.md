# Step 05 — Login Page

## Prompt for Claude Code

```
Create src/app/(auth)/layout.tsx:
- Center content: flex min-h-screen items-center justify-center
- Background: bg-[#F2F2F7]

Create src/app/(auth)/login/page.tsx (server component):
- Check auth(), redirect /profile if logged in

Create src/app/(auth)/login/login-form.tsx (client component):
Apple HIG login card:
- White card, max-w-[400px], rounded-[14px], shadow-apple-lg, p-8
- "HR Curie" — text-[28px] font-bold text-[#007AFF] centered, mb-6
- Email input: bg-[rgba(120,120,128,0.12)], no border, rounded-[8px],
  h-[44px], px-3, text-[17px], placeholder "Email"
- Password input: same + Eye/EyeOff toggle (lucide-react)
- 16px gap between inputs
- Sign In button: w-full h-[44px] bg-[#007AFF] text-white rounded-[8px]
  font-semibold text-[17px]. Hover: brightness-110%. Active: scale-[0.98].
  Transition: 150ms cubic-bezier(0.25,0.1,0.25,1)
- Loading: Loader2 animate-spin replacing button text
- Error: text-[13px] text-[#FF3B30] mt-2 below button
- react-hook-form + zodResolver + loginSchema
- signIn("credentials", { redirect: true, callbackUrl: "/" })
```

## Test
- `http://localhost:3000/login` — centered card on gray bg
- sofia@company.com / qwerty123# → redirects
- Wrong password → red error
- Visual: rounded corners, filled inputs, Apple blue button

## Commit
```bash
git add . && git commit -m "step-05: login page"
```
