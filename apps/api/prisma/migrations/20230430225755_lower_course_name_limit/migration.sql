/*
  Warnings:

  - You are about to alter the column `name` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);
