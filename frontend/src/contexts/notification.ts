import { NotificationAPI } from "@/types/api";
import { createContext } from "react";

type NotificationCountContext = {
  notificationCount: null | number;
  setNotificationCount: React.Dispatch<React.SetStateAction<null | number>>;
};

const NotificationCountContext = createContext<NotificationCountContext>({
  notificationCount: null,
  setNotificationCount: () => {},
});

type NotificationContext = {
  notifications: null | NotificationAPI[];
  setNotifications: React.Dispatch<
    React.SetStateAction<null | NotificationAPI[]>
  >;
  bufferedNotifications: NotificationAPI[];
  setBufferedNotifications: React.Dispatch<
    React.SetStateAction<NotificationAPI[]>
  >;
};

const NotificationContext = createContext<NotificationContext>({
  notifications: null,
  setNotifications: () => {},
  bufferedNotifications: [],
  setBufferedNotifications: () => {},
});

export { NotificationContext, NotificationCountContext };
