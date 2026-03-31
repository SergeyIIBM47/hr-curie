# Step 13 — Empty States + Loading Skeletons

## Prompt for Claude Code

```
Create src/components/shared/empty-state.tsx:
- Props: icon (LucideIcon), title, description, actionLabel?, actionHref?
- Centered: 48px icon text-[#AEAEB2], title apple-headline, description
  apple-subheadline text-gray-1, optional primary CTA button.

Employee list empty states:
- No search results: SearchX, "No employees found", "Try different search"
- No employees: UserPlus, "No employees yet", CTA "Add Employee"

Create src/components/shared/loading-skeleton.tsx:
- Apple pulse: opacity 0.4→1→0.4, 1500ms
- SkeletonTable (5 rows), SkeletonCard, SkeletonProfile

Add loading.tsx to: employees/, profile/, employees/[id]/
```

## Test
- Search nonsense → empty state. Navigate pages → skeletons appear.

## Commit
```bash
git add . && git commit -m "step-13: empty states and loading skeletons"
```
