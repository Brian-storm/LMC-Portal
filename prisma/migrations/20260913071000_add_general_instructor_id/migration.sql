-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "generalInstructorId" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_generalInstructorId_fkey" FOREIGN KEY ("generalInstructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;