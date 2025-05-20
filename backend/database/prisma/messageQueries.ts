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

export { createMessage, deleteAllMessageByContent };
