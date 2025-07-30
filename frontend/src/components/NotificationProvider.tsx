"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/user";
import { NotificationCountContext } from "@/contexts/notification";
import socket from "@/socket/socket";
import { connectToRoom } from "@/socket/eventHandler";

const NotificationCountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useContext(UserContext);
  const [notificationCount, setNotificationCount] = useState<null | number>(
    null
  );

  useEffect(() => {
    const fetchNotificationCount = async (id: string) => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/notification/unread-count`, {
          credentials: "include",
          mode: "cors",
          method: "GET",
        });

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          console.log({
            unreadNotificatioCount: resData.unreadNotificationCount,
          });
          setNotificationCount(resData.unreadNotificationCount);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    if (user && notificationCount === null) {
      fetchNotificationCount(user.id);

      socket.emit("subscribe", `notification:${user.id}`);
      socket.on(
        "notificationupdate",
        fetchNotificationCount.bind(this, user.id)
      );

      socket.on(
        "initiate",
        connectToRoom.bind(this, socket, `notification:${user.id}`)
      );
    }

    if (user === false) {
      setNotificationCount(null);
    }

    return () => {
      if (user) {
        socket.off("initiate");
        socket.off(
          "notificationupdate",
          fetchNotificationCount.bind(this, user.id)
        );
        socket.emit("unsubscribe", `notification:${user.id}`);
      }
    };
  }, [user, notificationCount]);

  return (
    <NotificationCountContext
      value={{ notificationCount, setNotificationCount }}
    >
      {children}
    </NotificationCountContext>
  );
};

export default NotificationCountProvider;
