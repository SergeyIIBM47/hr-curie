# Step 25 — Amplify Deployment Setup

## Prompt for Claude Code

```
Create amplify.yml (project root):
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*

Create amplify/backend.ts: minimal Amplify Gen 2 config.

Ensure next.config.ts has: output "standalone", reactCompiler true,
images.remotePatterns for S3 bucket.

Create .env.example documenting ALL vars:
DATABASE_URL (note: append ?connection_limit=5 for Lambda)
NEXTAUTH_URL, NEXTAUTH_SECRET, AWS_REGION, S3_BUCKET_NAME
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (future)

Create DEPLOYMENT.md: step-by-step guide:
1. Create RDS db.t4g.micro (single-AZ)
2. Create S3 bucket (private, CORS for Amplify domain)
3. Connect GitHub repo to Amplify Gen 2
4. Set env vars in Amplify Console
5. Deploy (auto-builds on push)
6. Run initial seed (connect to RDS, npx prisma db seed)
7. Test: sofia@company.com / qwerty123#
8. CHANGE DEFAULT PASSWORD IMMEDIATELY
```

## Commit
```bash
git add . && git commit -m "step-25: amplify deployment config"
```
