/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documents` ADD COLUMN `description` VARCHAR(500) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `documents_storageKey_key` ON `documents`(`storageKey`);

-- RenameIndex
ALTER TABLE `documents` RENAME INDEX `documents_employeeId_fkey` TO `documents_employeeId_idx`;
