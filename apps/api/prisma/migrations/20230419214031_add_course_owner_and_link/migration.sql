/*
  Warnings:

  - Added the required column `owner_id` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "owner_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "link" TEXT NOT NULL;
