# Step 07 — Profile Page

## Prompt for Claude Code

```
Create src/app/(dashboard)/profile/page.tsx (server component):
- requireAuth(), fetch employee from Prisma (include employmentType, user.role)

Layout:
- Top: 96px avatar circle (gray-5 bg, initials fallback) + name (text-[28px]
  font-bold) + position (text-[15px] text-[#8E8E93]) + role badge + "Change Avatar" ghost btn
- Info card: bg-white rounded-[10px] shadow-apple-sm p-5 mt-6
  Title: "Personal Information" text-[20px] font-semibold mb-5
  Grid: md:grid-cols-2, gap-5

Create src/components/shared/detail-field.tsx:
- Props: label, value (string | null)
- Label: text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93] mb-1
- Value: text-[17px] text-[#1D1D1F]. Empty: "—" in text-[#AEAEB2]
- LinkedIn: clickable link in text-[#007AFF]

Fields order: First Name, Last Name, Work Email, Employment Type,
Date of Birth (formatted "January 1, 1990" via date-fns), Actual Residence,
Start Year. Optional fields only if they have values.
```

## Test
- My Profile → Sofia's data displayed, 2-col desktop / 1-col mobile
- Initials "SA", ADMIN badge indigo, formatted date

## Commit
```bash
git add . && git commit -m "step-07: profile page"
```
