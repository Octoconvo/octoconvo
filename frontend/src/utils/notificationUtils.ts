import { NotificationAPI } from "@/types/api";

const pushBufferedNotifications = ({
  notifications,
  bufferedNotifications,
}: {
  notifications: NotificationAPI[];
  bufferedNotifications: NotificationAPI[];
}): NotificationAPI[] => {
  const updateNotifications = notifications.map((notif) => {
    const index = bufferedNotifications.findIndex(
      (buffer) => buffer.id === notif.id
    );

    return index > -1 ? bufferedNotifications[index] : notif;
  });

  return updateNotifications;
};

export { pushBufferedNotifications };
