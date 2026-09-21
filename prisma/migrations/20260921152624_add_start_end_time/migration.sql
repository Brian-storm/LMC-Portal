/*
  Adds startTime / endTime columns, backfills from dateAndTime,
  then makes them NOT NULL. Also makes sessionDate NOT NULL.
*/

-- Step 1: Add columns as nullable
ALTER TABLE "schedules" ADD COLUMN "startTime" TEXT;
ALTER TABLE "schedules" ADD COLUMN "endTime" TEXT;

-- Step 2: Backfill existing rows by parsing dateAndTime
-- dateAndTime format examples:
--   "22/09/2026 (星期二) 14:15 - 15:45"
--   "2026-09-15 (Sat) 10:00 - 17:00"
UPDATE "schedules"
SET
  "startTime" = CASE
    WHEN "dateAndTime" ~ '^\d{2}/\d{2}/\d{4}' THEN
      SPLIT_PART(SPLIT_PART("dateAndTime", ' ', 3), ' - ', 1)
    WHEN "dateAndTime" ~ '^\d{4}-\d{2}-\d{2}' THEN
      SPLIT_PART(SPLIT_PART("dateAndTime", ' ', 3), ' - ', 1)
    ELSE ''
  END,
  "endTime" = CASE
    WHEN "dateAndTime" ~ '^\d{2}/\d{2}/\d{4}' THEN
      SPLIT_PART(SPLIT_PART("dateAndTime", ' ', 3), ' - ', 2)
    WHEN "dateAndTime" ~ '^\d{4}-\d{2}-\d{2}' THEN
      SPLIT_PART(SPLIT_PART("dateAndTime", ' ', 3), ' - ', 2)
    ELSE ''
  END;

-- Step 3: Handle any existing NULL sessionDate rows (set to a default)
UPDATE "schedules" SET "sessionDate" = '2026-01-01'::date WHERE "sessionDate" IS NULL;

-- Step 4: Make columns NOT NULL
ALTER TABLE "schedules" ALTER COLUMN "startTime" SET NOT NULL;
ALTER TABLE "schedules" ALTER COLUMN "endTime" SET NOT NULL;
ALTER TABLE "schedules" ALTER COLUMN "sessionDate" SET NOT NULL;