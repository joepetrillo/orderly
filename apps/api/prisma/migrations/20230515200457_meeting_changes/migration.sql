/*
  Warnings:

  - Changed the type of `start_time` on the `Meeting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `Meeting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "day" SET DATA TYPE VARCHAR(10),
DROP COLUMN "start_time",
ADD COLUMN     "start_time" CHAR(5) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" CHAR(5) NOT NULL;
