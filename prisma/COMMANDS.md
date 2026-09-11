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
| `npx prisma migrate dev --name <name>` | Create + apply a new migration (dev) |
| `npx prisma migrate deploy` | Apply pending migrations (prod) |
| `npx prisma db push` | Push schema directly without migration (dev only) |

## Data

| Command | Purpose |
|---|---|
| `npx prisma db seed` | Run seed script (`tsx prisma/seed.ts`) |
| `npx tsx prisma/seed.ts` | Same — direct execution |
| `npx prisma studio` | Open browser-based DB GUI |

## Typical Workflow

1. Edit `prisma/schema.prisma` → `npx prisma migrate dev --name <desc>`
2. Edit `prisma/seed.ts` → `npx prisma db seed`
3. Verify → `npm run typecheck && npm run lint`