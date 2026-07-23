-- AlterTable
ALTER TABLE `family_activities` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` INTEGER NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `family_activities` ADD CONSTRAINT `family_activities_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
