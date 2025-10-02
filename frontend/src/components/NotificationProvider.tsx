"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/contexts/user";
import {
  NotificationContext,
  NotificationCountContext,
} from "@/contexts/notification";
import socket from "@/socket/socket";
import { connectToRoom } from "@/socket/eventHandler";
import { NotificationAPI } from "@/types/api";
import { NotificationModalContext } from "@/contexts/modal";
import {
  getNotificationCountFromAPI,
  postNotificationsReadStatusesToAPI,
} from "@/api/notification";
import { pushBufferedNotifications } from "@/utils/notificationUtils";

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(UserContext);
  const [notificationCount, setNotificationCount] = useState<null | number>(
    null
  );
  const [notifications, setNotifications] = useState<null | NotificationAPI[]>(
    null
  );
  const [bufferedNotifications, setBufferedNotifications] = useState<
    NotificationAPI[]
  >([]);
  const notificationModal = useRef<null | HTMLDivElement>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);
  const [isNotificationModalAnimating, setIsNotificationModalAnimating] =
    useState<boolean>(false);

  const loadNotificationCount = async () => {
    try {
      const { status, unreadNotificationCount } =
        await getNotificationCountFromAPI();

      if (
        status >= 200 &&
        status <= 300 &&
        unreadNotificationCount !== undefined
      ) {
        setNotificationCount(unreadNotificationCount);
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  useEffect(() => {
    // Fetch initial unread notification count
    if (user && notificationCount === null) {
      loadNotificationCount();
    }

    if (user) {
      // Listen to notification update
      socket.emit("subscribe", `notification:${user.id}`);
      socket.on("notificationupdate", loadNotificationCount);

      socket.on(
        "initiate",
        connectToRoom.bind(this, socket, `notification:${user.id}`)
      );
    }

    if (user === false) {
      setNotificationCount(null);
    }

    // Push bufferedNotifications to notifications

    if (
      notifications &&
      bufferedNotifications.length &&
      !isNotificationModalOpen
    ) {
      const updatedNotifications = pushBufferedNotifications({
        notifications,
        bufferedNotifications,
      });

      setBufferedNotifications([]);
      setNotifications([...updatedNotifications]);
    }

    // Update notificationCount when bufferedNotifications is not empty
    if (bufferedNotifications.length > 0 && !isNotificationModalOpen) {
      loadNotificationCount();
    }

    return () => {
      if (user) {
        socket.off("initiate");
        socket.off("notificationupdate", loadNotificationCount);
        socket.emit("unsubscribe", `notification:${user.id}`);
      }
    };
  }, [
    user,
    notifications,
    bufferedNotifications,
    isNotificationModalOpen,
    notificationCount,
  ]);

  type CreateNotificationsReadStatusesFormData = {
    startDate: string;
    endDate: string;
  };

  const createNotificationsReadStatusesFormData = ({
    startDate,
    endDate,
  }: CreateNotificationsReadStatusesFormData) => {
    const formData = new URLSearchParams();
    formData.append("startdate", startDate);
    formData.append("enddate", endDate);

    return formData;
  };

  type UpdateNotificationsReadStatuses = {
    notifications: NotificationAPI[];
  };

  const updateNotificationsReadStatuses = async ({
    notifications,
  }: UpdateNotificationsReadStatuses) => {
    try {
      const startDate = notifications[0].createdAt;
      const endDate = notifications[notifications.length - 1].createdAt;

      const formData = createNotificationsReadStatusesFormData({
        startDate,
        endDate,
      });

      const { status, notifications: updatedNotifications } =
        await postNotificationsReadStatusesToAPI({ formData });

      if (status >= 200 && status <= 300 && updatedNotifications) {
        setBufferedNotifications([
          ...bufferedNotifications,
          ...updatedNotifications,
        ]);
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  return (
    <NotificationModalContext
      value={{
        notificationModal,
        toggleNotificationModalView: () => {
          setIsNotificationModalAnimating(true);
          setIsNotificationModalOpen(!isNotificationModalOpen);
        },

        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isNotificationModalAnimating,
        setIsNotificationModalAnimating,
      }}
    >
      <NotificationContext
        value={{
          notifications,
          setNotifications,
          bufferedNotifications,
          setBufferedNotifications,
          updateNotificationsReadStatuses,
        }}
      >
        <NotificationCountContext
          value={{ notificationCount, setNotificationCount }}
        >
          {children}
        </NotificationCountContext>
      </NotificationContext>
    </NotificationModalContext>
  );
};

export default NotificationProvider;
