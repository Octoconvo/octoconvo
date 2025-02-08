-- AlterTable
ALTER TABLE "Community" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "isDeleted" SET DEFAULT false,
ALTER COLUMN "isRead" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isDeleted" SET DEFAULT false;
