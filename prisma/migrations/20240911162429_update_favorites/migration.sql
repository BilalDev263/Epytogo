/*
  Warnings:

  - Added the required column `address` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeName` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Favorite` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    ADD COLUMN `placeName` VARCHAR(191) NOT NULL;
