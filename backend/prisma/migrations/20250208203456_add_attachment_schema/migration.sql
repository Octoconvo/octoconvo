-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE');

-- CreateEnum
CREATE TYPE "AttachmentSubtype" AS ENUM ('JPEG', 'PNG', 'GIF');

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "subtype" "AttachmentSubtype" NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "size" INTEGER,
    "url" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
