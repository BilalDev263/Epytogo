/*
  Warnings:

  - You are about to drop the column `address` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Place` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Place` DROP COLUMN `address`,
    DROP COLUMN `name`,
    DROP COLUMN `type`;
