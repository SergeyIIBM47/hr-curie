# Step 12 — Avatar Upload

## Prompt for Claude Code

```
Create POST at src/app/api/employees/[id]/avatar/route.ts:
- requireApiAuth(). ADMIN or own profile only.
  S3 key: avatars/{id}/{timestamp}.jpg. Presigned upload (5min) + download (7day).
  Update avatarUrl in DB. Return {uploadUrl, avatarUrl}.

Create src/lib/s3.ts: S3Client, generatePresignedUploadUrl, generatePresignedDownloadUrl.

Create src/components/employees/avatar-upload.tsx (client):
- Display: 96px circle (profile) / 40px (lists). Hover overlay with Upload icon.
- Click → hidden file input (accept image/jpeg,image/png). Max 5MB.
- Preview via URL.createObjectURL. API call → PUT to S3.
- Dev fallback: if no S3_BUCKET_NAME, store base64 in avatarUrl.

Integrate into profile and employee detail pages.
```

## Test
- Hover avatar → overlay. Upload JPEG → preview. Shows in sidebar + list.

## Commit
```bash
git add . && git commit -m "step-12: avatar upload"
```
