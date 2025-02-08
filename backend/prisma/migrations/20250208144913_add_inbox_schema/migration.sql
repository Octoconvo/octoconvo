-- CreateEnum
CREATE TYPE "InboxType" AS ENUM ('DM', 'COMMUNITY');

-- CreateTable
CREATE TABLE "Inbox" (
    "id" TEXT NOT NULL,
    "inboxType" "InboxType" NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inbox_communityId_key" ON "Inbox"("communityId");

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
