/*
  Warnings:

  - You are about to drop the column `source` on the `income` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `income` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `income` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `expenses` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by` INTEGER NULL;

-- AlterTable
ALTER TABLE `income` DROP COLUMN `source`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by` INTEGER NULL;

-- CreateIndex
CREATE INDEX `income_category_idx` ON `income`(`category`);

-- AddForeignKey
ALTER TABLE `income` ADD CONSTRAINT `income_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
