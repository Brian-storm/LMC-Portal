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

## Local Database Management

The database runs in a Docker container managed by npm scripts:

| Command | Purpose |
|---|---|
| `npm run db:start` | Start local PostgreSQL container |
| `npm run db:stop` | Stop local PostgreSQL container |
| `npm run db:reset` | Destroy & recreate local DB (drops **all** data) |
| `npm run db:migrate` | Run `prisma migrate dev` against local DB |

> **CAUTION**: `npm run db:reset` runs `docker compose down -v` which destroys the volume. All data is lost.

## Local → Production Workflow

Use this flow when you change schema (`schema.prisma`) **or** seed data (`seed.ts`).

### 1. Update Local Database

**Scenario A — Schema change** (e.g., new table, new column):

```sh
# Create a new migration file and apply it locally
npx prisma migrate dev --name describe-the-change
```

**Scenario B — Seed data change only** (e.g., fixed instructor mapping):

```sh
# Reset local DB, re-run migrations, then seed
npm run db:reset
npm run db:migrate
npx prisma db seed
```

Then verify:

```sh
npm run typecheck && npm run lint
npm run dev    # manually check the UI
```

### 2. Commit & Push

```sh
git add -A
git commit -m "describe what changed and why"
git push
```

The migration file (in `prisma/migrations/`) and seed script are now in the remote repo.

### 3. Update Production Database

Set `DATABASE_URL` in your production environment (e.g., AWS Amplify environment variables) to point to the production PostgreSQL instance.

**Production deploy** — applies only pending migrations, does **not** create new ones:

```sh
# Point to production DATABASE_URL first, then:
npx prisma migrate deploy
```

**Seed on production** (only if the production DB needs seed data):

```sh
npx prisma db seed
```

> **Never** run `npm run db:reset` or `prisma migrate dev` against production — those are local-only commands.

### Summary of Key Differences

| | Local | Production |
|---|---|---|
| Migration command | `prisma migrate dev` | `prisma migrate deploy` |
| Data reset | `npm run db:reset` | ❌ Never |
| Seed | `prisma db seed` | Only if needed |
| DATABASE_URL | Local Docker Postgres | Production PostgreSQL |