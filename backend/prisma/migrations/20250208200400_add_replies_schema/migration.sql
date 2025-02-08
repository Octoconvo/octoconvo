-- CreateTable
CREATE TABLE "Replies" (
    "replyById" TEXT NOT NULL,
    "replyToId" TEXT NOT NULL,

    CONSTRAINT "Replies_pkey" PRIMARY KEY ("replyById","replyToId")
);

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_replyById_fkey" FOREIGN KEY ("replyById") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
