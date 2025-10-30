-- AlterTable
ALTER TABLE `payrolls` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `payrolls_employeeId_fkey` ON `payrolls`(`employeeId`);

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
