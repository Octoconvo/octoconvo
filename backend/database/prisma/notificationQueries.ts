import { Prisma } from "@prisma/client";

const createNotificationsTransaction = async ({
  tx,
  type,
  communityId,
  triggeredById,
  triggeredForIds,
  payload,
}: {
  tx: Prisma.TransactionClient;
  type: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
  communityId: string | null;
  triggeredById: string;
  triggeredForIds: string[];
  payload: string;
}) => {
  type NotificationQuery = {
    type: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
    communityId: string | null;
    triggeredById: string;
    triggeredForId: string;
    payload: string;
    isRead: boolean;
  };

  const createNotifications = triggeredForIds.map(
    async triggeredForId =>
      new Promise<NotificationQuery>(resolve => {
        resolve({
          type: type,
          communityId: communityId,
          triggeredById: triggeredById,
          triggeredForId: triggeredForId,
          payload: payload,
          isRead: false,
        });
      }),
  );

  const notifications: NotificationQuery[] =
    await Promise.all(createNotifications);

  return tx.notification.createMany({
    data: [...notifications],
  });
};

export { createNotificationsTransaction };
