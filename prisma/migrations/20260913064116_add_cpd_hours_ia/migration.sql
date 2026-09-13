-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "coOrganizerLogoUrl" TEXT,
ADD COLUMN     "organizerLogoUrl" TEXT;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "cpdHoursIa" DECIMAL(4,1) NOT NULL DEFAULT 1.5;

-- CreateTable
CREATE TABLE "schedule_instructors" (
    "scheduleId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,

    CONSTRAINT "schedule_instructors_pkey" PRIMARY KEY ("scheduleId","instructorId")
);

-- AddForeignKey
ALTER TABLE "schedule_instructors" ADD CONSTRAINT "schedule_instructors_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_instructors" ADD CONSTRAINT "schedule_instructors_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
