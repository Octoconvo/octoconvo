/*
  Warnings:

  - A unique constraint covering the columns `[directMessageId]` on the table `Inbox` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `directMessageId` to the `Inbox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inbox" ADD COLUMN     "directMessageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inbox_directMessageId_key" ON "Inbox"("directMessageId");

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "DirectMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
