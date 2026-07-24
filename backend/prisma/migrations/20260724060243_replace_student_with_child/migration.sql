/*
  Warnings:

  - You are about to drop the column `student_id` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[child_id,class_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `child_id` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `child_id` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_family_id_fkey`;

-- DropIndex
DROP INDEX `attendance_student_id_lesson_date_idx` ON `attendance`;

-- DropIndex
DROP INDEX `enrollments_student_id_class_id_key` ON `enrollments`;

-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `student_id`,
    ADD COLUMN `child_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `classes` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `enrollments` DROP COLUMN `student_id`,
    ADD COLUMN `child_id` INTEGER NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE `students`;

-- CreateIndex
CREATE INDEX `attendance_child_id_lesson_date_idx` ON `attendance`(`child_id`, `lesson_date`);

-- CreateIndex
CREATE UNIQUE INDEX `enrollments_child_id_class_id_key` ON `enrollments`(`child_id`, `class_id`);

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_child_id_fkey` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_child_id_fkey` FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
