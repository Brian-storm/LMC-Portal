# Prisma Commands Reference

> Database: PostgreSQL · ORM: Prisma 6 · Schema: `prisma/schema.prisma` · Seed: `prisma/seed.ts`

## Schema & Client

| Command | Purpose |
|---|---|
| `npx prisma validate` | Validate schema syntax |
| `npx prisma format` | Format `schema.prisma` |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |

## Migrations

| Command | Purpose |
|---|---|
| `npx prisma migrate dev --name <name>` | Create + apply a new migration (local dev) |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma db push` | Push schema directly without migration (dev only) |

## Data

| Command | Purpose |
|---|---|
| `npx prisma db seed` | Run seed script (`tsx prisma/seed.ts`) |
| `npx tsx prisma/seed.ts` | Same — direct execution |
| `npx prisma studio` | Open browser-based DB GUI |

## Local Database (Docker)

| Command | Purpose |
|---|---|
| `npm run db:start` | Start local PostgreSQL container |
| `npm run db:stop` | Stop local PostgreSQL container |
| `npm run db:reset` | Destroy & recreate local DB (drops **all** data) |
| `npm run db:migrate` | Run `prisma migrate dev` against local DB |

## Workflow: Local → Production

### 1. Make changes locally

**Schema change** (new table, column, etc.):
```
npx prisma migrate dev --name describe-the-change
```

**Seed data change only** (e.g., fixed instructor data):
```
npm run db:reset && npm run db:migrate && npx prisma db seed
```

Verify:
```
npm run typecheck && npm run lint
```

### 2. Commit & push

```
git add -A && git commit -m "describe the change" && git push
```

### 3. Deploy to production

Set `DATABASE_URL` in production environment to point to the production PostgreSQL instance.

**Apply migrations** (never use `migrate dev` here):
```
npx prisma migrate deploy
```

**Seed if needed**:
```
npx prisma db seed
```

> ⚠️ Never run `npm run db:reset` or `prisma migrate dev` against production.