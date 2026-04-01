# Amplify Build Configuration

Paste this into **Amplify Console -> App Settings -> Build settings -> Edit**.

## amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx prisma generate
        - npx prisma migrate deploy
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - .npm/**/*
```

## Required Environment Variables

Set in **Amplify Console -> App Settings -> Environment variables**:

| Variable | Value | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://hrcrm:<password>@hrcrm.c1mwocaw4y9l.eu-west-1.rds.amazonaws.com:5432/hrcrm?connection_limit=5` | Prisma DB connection |
| `NEXTAUTH_URL` | `https://<your-amplify-domain>.amplifyapp.com` | Auth callback URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | JWT signing key |

## What the build does

1. `npm ci` -- installs dependencies from lockfile
2. `prisma generate` -- builds the Prisma client
3. `prisma migrate deploy` -- applies pending migrations to RDS (safe for CI, never creates new migrations)
4. `npm run build` -- Next.js production build
