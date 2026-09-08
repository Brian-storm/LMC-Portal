-- CreateTable: many-to-many join between registrants and schedules
CREATE TABLE "registrant_schedules" (
    "registrantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "registrant_schedules_pkey" PRIMARY KEY ("registrantId","scheduleId")
);

-- AddForeignKey
ALTER TABLE "registrant_schedules" ADD CONSTRAINT "registrant_schedules_registrantId_fkey" FOREIGN KEY ("registrantId") REFERENCES "registrants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrant_schedules" ADD CONSTRAINT "registrant_schedules_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;