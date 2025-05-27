import prisma from "./client";

const createMessage = async ({
  authorId,
  inboxId,
  content,
  attachments,
}: {
  authorId: string;
  inboxId: string;
  content: string;
  attachments: {
    type: "IMAGE";
    subtype: "JPEG" | "PNG" | "GIF";
    height: number;
    width: number;
    size: number;
    url: string;
    thumbnailUrl: string;
  }[];
}) => {
  const message = await prisma.message.create({
    data: {
      authorId,
      inboxId,
      content,
      ...(attachments.length > 0
        ? {
            attachments: {
              create: attachments,
            },
          }
        : {}),
    },
    include: {
      attachments: true,
    },
  });

  return message;
};

const deleteAllMessageByContent = async (content: string) => {
  const messages = await prisma.message.findMany({
    where: {
      content: content,
    },
  });

  for (const message of messages) {
    const deleteMessage = prisma.message.delete({
      where: { id: message.id },
    });

    const deleteAttachments = prisma.attachment.deleteMany({
      where: {
        messageId: message.id,
      },
    });

    prisma.$transaction([deleteAttachments, deleteMessage]);
  }
};

const getMessages = async ({
  inboxId,
  limit,
  cursor,
  direction,
}: {
  inboxId: string;
  cursor: {
    createdAt: string;
    id: string;
  } | null;
  limit: number | null;
  direction: "forward" | "backward";
}) => {
  console.log({
    limit,
    cursor,
    direction,
  });
  const messages = await prisma.message.findMany({
    where: {
      inboxId: inboxId,
      ...(cursor
        ? {
            OR: [
              {
                AND: [
                  {
                    id: {
                      ...(direction === "backward"
                        ? { gt: cursor.id }
                        : { lt: cursor.id }),
                    },
                  },
                  { createdAt: cursor.createdAt },
                ],
              },
              {
                // Get messages before or after the created date of the cursor
                // createdAt value
                createdAt: {
                  ...(direction === "backward"
                    ? { lt: cursor.createdAt }
                    : { gt: cursor.createdAt }),
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      { createdAt: direction === "backward" ? "desc" : "asc" },
      { id: "asc" },
    ],
    ...(limit ? { take: limit } : {}),
  });

  return messages;
};

export { createMessage, deleteAllMessageByContent, getMessages };
