-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_directMessageId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_directMessageId_fkey";

-- AlterTable
ALTER TABLE "Inbox" ALTER COLUMN "communityId" DROP NOT NULL,
ALTER COLUMN "directMessageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Participant" ALTER COLUMN "communityId" DROP NOT NULL,
ALTER COLUMN "directMessageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
