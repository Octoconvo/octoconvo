import { NotificationGET } from "@/types/response";

const pushBufferedNotifications = ({
  notifications,
  bufferedNotifications,
}: {
  notifications: NotificationGET[];
  bufferedNotifications: NotificationGET[];
}): NotificationGET[] => {
  const updateNotifications = notifications.map((notif) => {
    const index = bufferedNotifications.findIndex(
      (buffer) => buffer.id === notif.id
    );

    return index > -1 ? bufferedNotifications[index] : notif;
  });

  return updateNotifications;
};

export { pushBufferedNotifications };
