import { NotificationGET } from "@/types/api";
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
  notifications: null | NotificationGET[];
  setNotifications: React.Dispatch<
    React.SetStateAction<null | NotificationGET[]>
  >;
  bufferedNotifications: NotificationGET[];
  setBufferedNotifications: React.Dispatch<
    React.SetStateAction<NotificationGET[]>
  >;
};

const NotificationContext = createContext<NotificationContext>({
  notifications: null,
  setNotifications: () => {},
  bufferedNotifications: [],
  setBufferedNotifications: () => {},
});

export { NotificationContext, NotificationCountContext };
