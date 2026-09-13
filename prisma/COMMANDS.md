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

---

## Production Database Setup — Problem Summary

This section documents issues encountered during initial production deployment on 2026-09-13.

### 1. Schema-migration mismatch (missing `generalInstructorId`)

**Problem:** The `schema.prisma` had `generalInstructorId` on the `Course` model, but no migration was ever created for it. Running `prisma db seed` on RDS failed with `P2022` — column `courses.generalInstructorId` does not exist.

**Root cause:** The field was added to the schema but `prisma migrate dev --name <name>` was never run, so no migration file was generated.

**Potential consequence:** Seed would always fail on a fresh RDS, blocking deployment. If already deployed with seed data, the column would be missing and any code referencing it would crash at runtime.

**Solution:**
1. Switched `.env` to local Docker DB.
2. Ran `prisma migrate dev --name add_general_instructor_id` to create the migration.
3. Also created a second migration to drop stale `course_instructors` table (removed from schema earlier but left orphaned).
4. Switched `.env` back to RDS.
5. Ran `prisma migrate deploy` to apply both.

### 2. BOM character in migration SQL file

**Problem:** The first generated migration file `20260913071000_add_general_instructor_id/migration.sql` was saved with a **UTF-8 BOM** (Byte Order Mark, bytes `EF BB BF`). PostgreSQL rejected it with `syntax error at or near ""` (invisible BOM character).

**Root cause:** The PowerShell environment or file-writing tool created the file with BOM. Prisma's SQL parser does not strip BOM.

**Potential consequence:** The migration failed to apply to both the shadow database (local) and RDS (if attempted), causing `P3006` errors and blocking all subsequent migrations.

**Solution:** Rewrote the file as UTF-8 without BOM using PowerShell:
```powershell
$content = Get-Content -Raw -LiteralPath "migration.sql"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("migration.sql", $content, $utf8NoBom)
```

### 3. Failed migration record on RDS (P3009)

**Problem:** The BOM-affected migration was attempted against RDS before the BOM was discovered (`.env` was pointed at RDS). The migration failed, leaving a `failed` record in the `_prisma_migrations` table. Subsequent `prisma migrate deploy` refused to proceed with `P3009` — "found failed migrations".

**Root cause:** Human error — attempted `migrate dev` while `.env` pointed at RDS instead of local.

**Potential consequence:** All future migrations blocked until the failed record is resolved. Requires database-side fix.

**Solution:** Marked the failed migration as rolled back (it applied no changes — the ALTER TABLE failed alongside the BOM error):
```
npx prisma migrate resolve --rolled-back 20260913071000_add_general_instructor_id
```

### 4. EPERM on `prisma generate`

**Problem:** `npx prisma generate` failed with `EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...'`. The rename of the temporary engine DLL to the final name was denied.

**Root cause:** The `query_engine-windows.dll.node` file was held open by a running Node.js process (likely the Prisma CLI or an orphaned process from a previous run).

**Potential consequence:** Prisma Client would not be regenerated, causing type errors in code that references the new `generalInstructorId` field.

**Solution:** Killed all Node.js processes and retried:
```powershell
Get-Process node | Stop-Process -Force
npx prisma generate
```

### Key Takeaway

Always verify `.env` points to **local Docker** before running `migrate dev`, and always check generated migration `.sql` files for BOM before committing.