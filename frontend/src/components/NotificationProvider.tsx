"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/contexts/user";
import {
  NotificationContext,
  NotificationCountContext,
} from "@/contexts/notification";
import socket from "@/socket/socket";
import { connectToRoom } from "@/socket/eventHandler";
import { NotificationGET } from "@/types/response";
import { NotificationModalContext } from "@/contexts/modal";
import { notificationCountGET } from "@/api/notification";

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(UserContext);
  const [notificationCount, setNotificationCount] = useState<null | number>(
    null
  );
  const [notifications, setNotifications] = useState<null | NotificationGET[]>(
    null
  );
  const [bufferedNotifications, setBufferedNotifications] = useState<
    NotificationGET[]
  >([]);
  const notificationModal = useRef<null | HTMLDivElement>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);
  const [isNotificationModalAnimating, setIsNotificationModalAnimating] =
    useState<boolean>(false);

  useEffect(() => {
    // Fetch initial unread notification count
    if (user && notificationCount === null) {
      notificationCountGET({
        successHandler: ({ data }: { data: number }) => {
          setNotificationCount(data);
        },
      });

      // Listen to notification update
      socket.emit("subscribe", `notification:${user.id}`);
      socket.on("notificationupdate", notificationCountGET);

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
      const updatedNotifications = notifications.map((notif) => {
        const index = bufferedNotifications.findIndex(
          (buffer) => buffer.id === notif.id
        );
        return index > -1 ? bufferedNotifications[index] : notif;
      });

      setBufferedNotifications([]);
      setNotifications([...updatedNotifications]);
    }

    // Update notificationCount when bufferedNotifications is not empty
    if (bufferedNotifications.length > 0 && !isNotificationModalOpen) {
      notificationCountGET({
        successHandler: ({ data }: { data: number }) =>
          setNotificationCount(data),
      });
    }

    return () => {
      if (user) {
        socket.off("initiate");
        socket.off("notificationupdate", notificationCountGET);
        socket.emit("unsubscribe", `notification:${user.id}`);
      }
    };
  }, [user, notifications, bufferedNotifications, isNotificationModalOpen]);

  return (
    <NotificationModalContext
      value={{
        notificationModal,
        toggleNotificationModalView: () => {
          setIsNotificationModalAnimating(true);
          setIsNotificationModalOpen(!isNotificationModalOpen);
        },
        isNotificationModalOpen,
        isNotificationModalAnimating,
      }}
    >
      <NotificationContext
        value={{
          notifications,
          setNotifications,
          bufferedNotifications,
          setBufferedNotifications,
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
