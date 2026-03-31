# Step 09 — Create Employee Form + API

## Prompt for Claude Code

```
Add POST to src/app/api/employees/route.ts:
- requireApiAuth("ADMIN"). Validate createEmployeeSchema.
  Check email unique (409). Transaction: create User (bcrypt 12 rounds)
  + Employee. Return 201. Never return passwordHash.

Create src/lib/validations/employee.ts:
- createEmployeeSchema: required fields validated, optional .optional().or(z.literal(""))
- updateEmployeeSchema: omit password+workEmail, .partial()

Create src/app/(dashboard)/employees/new/page.tsx: requireAuth("ADMIN"),
fetch employment types.

Create src/components/employees/employee-form.tsx (client):
- Reusable (optional initialData). react-hook-form + zodResolver.
- Apple inputs: bg fill-primary, no border, h-[44px], rounded-[8px]
- Labels: text-[16px] text-[#3C3C43] mb-1.5. Errors: text-[13px] text-[#FF3B30]
- Section 1 "Required Information": 2-col grid. Fields: First Name, Last Name,
  Work Email, Password (create only), Employment Type (select), Date of Birth,
  Actual Residence, Start Year.
- Section 2 "Optional Information": Phone, Position, Department, Location,
  Health Insurance, Education, Certifications, LinkedIn, T-Shirt Size.
- Cancel (ghost) + Create Employee (primary, loading spinner).
- Success: toast + redirect /employees. Error: toast.
```

## Test
- Add Employee → fill required → creates. Duplicate email → error. Prisma Studio: hashed password.

## Commit
```bash
git add . && git commit -m "step-09: create employee"
```
