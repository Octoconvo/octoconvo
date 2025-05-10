/*
  Warnings:

  - You are about to drop the `Replies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Replies" DROP CONSTRAINT "Replies_replyById_fkey";

-- DropForeignKey
ALTER TABLE "Replies" DROP CONSTRAINT "Replies_replyToId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "replyToId" TEXT;

-- DropTable
DROP TABLE "Replies";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
