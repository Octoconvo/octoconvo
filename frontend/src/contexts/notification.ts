import { createContext } from "react";

type NotificationCountContext = {
  notificationCount: null | number;
  setNotificationCount: React.Dispatch<React.SetStateAction<null | number>>;
};

const NotificationCountContext = createContext<NotificationCountContext>({
  notificationCount: null,
  setNotificationCount: () => {},
});

export { NotificationCountContext };
