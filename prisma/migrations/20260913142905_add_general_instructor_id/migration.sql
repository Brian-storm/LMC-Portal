/*
  Warnings:

  - You are about to drop the `course_instructors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_instructors" DROP CONSTRAINT "course_instructors_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_instructors" DROP CONSTRAINT "course_instructors_instructorId_fkey";

-- DropTable
DROP TABLE "course_instructors";
