-- CreateEnum
CREATE TYPE "NotificationStatusType" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "status" "NotificationStatusType" NOT NULL DEFAULT 'PENDING';
