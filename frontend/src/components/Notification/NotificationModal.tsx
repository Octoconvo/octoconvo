"use client";

import { NotificationModalContext } from "@/contexts/modal";
import { useContext, useEffect, useState, useRef } from "react";
import { NotificationGET } from "@/types/response";
import NotificationRequestItem from "./NotificationRequestItem";
import socket from "@/socket/socket";
import { UserContext } from "@/contexts/user";
import { connectToRoom } from "@/socket/eventHandler";

const NotificationModal = () => {
  const {
    notificationModal,
    isNotificationModalOpen,
    isNotificationModalAnimating,
  } = useContext(NotificationModalContext);
  const [notifications, setNotifications] = useState<null | NotificationGET[]>(
    null
  );
  const [nextCursor, setNextCursor] = useState<null | false | string>(null);
  const nextObserverRef = useRef<null | HTMLDivElement>(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;
      const cursorQuery = nextCursor ? `&cursor=${nextCursor}` : "";

      try {
        const res = await fetch(
          `${domainURL}/notifications?limit=10${cursorQuery}`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        );

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }
        console.log({ notifications: resData.notifications });
        if (res.status >= 200 && res.status <= 300) {
          if (notifications === null) {
            setNotifications(resData.notifications);
          } else {
            setNotifications([...notifications, ...resData.notifications]);
          }

          setNextCursor(resData.nextCursor);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    console.log({ notifications, isNotificationModalOpen });
    // fetch initial notifications if the notifications is null
    if (notifications === null && isNotificationModalOpen) {
      fetchNotifications();
    }

    // Handle infinite scroll fetching
    const nextObserver = nextObserverRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        /* Fetch next notifications if cursor is not null or false and
        notifications is not null */

        if (notifications && nextCursor) {
          fetchNotifications();
        }
      }
    });

    if (nextObserver) {
      observer.observe(nextObserver);
    }

    // Handle notification modal animation and view state
    const hideModal = () => {
      if (!isNotificationModalOpen)
        notificationModal?.current?.classList.add("hidden");
    };

    const notificationModalCurrent = notificationModal?.current;

    if (notificationModalCurrent) {
      notificationModalCurrent.addEventListener("animationend", hideModal);
    }

    const pushNewNotification = (notification: NotificationGET) => {
      if (notifications !== null) {
        setNotifications([notification, ...notifications]);
      }
    };

    if (user) {
      // Join the user's notification room
      socket.emit("subscribe", `notification:${user.id}`);

      // Listen to socket notification creation
      socket.on("notificationcreate", pushNewNotification);
      socket.on(
        "initiate",
        connectToRoom.bind(this, socket, `notification:${user.id}`)
      );
    }

    return () => {
      if (notificationModalCurrent) {
        notificationModalCurrent.removeEventListener("animationend", hideModal);
      }

      if (nextObserver) {
        observer.unobserve(nextObserver);
      }

      if (user) {
        // Leave the user's notification room
        socket.emit("unsubscribe", `notification:${user.id}`);

        // Stop listening to socket notification creation
        socket.off("notificationcreate", pushNewNotification);
        socket.off(
          "initiate",
          connectToRoom.bind(this, socket, `notification:${user.id}`)
        );
      }
    };
  }, [isNotificationModalOpen, nextCursor, notifications]);

  return (
    <div
      data-testid="ntfctn-mdl"
      ref={notificationModal}
      className={
        "absolute z-0 rounded-br-[16px] rounded-tr-[16px] border-r-[1px]" +
        " overflow-hidden top-0 left-[100%] border-r-white-200-op-025" +
        (isNotificationModalOpen
          ? " animate-slide-right"
          : " animate-slide-left") +
        (!isNotificationModalOpen && !isNotificationModalAnimating
          ? " hidden"
          : "")
      }
    >
      <article
        className={
          "min-w-[480px] max-w-[480px] bg-gr-black-1-b p-[32px]" +
          " pt-0 min-h-[100dvh] font-bold text-white-100" +
          "  max-h-[100dvh] overflow-auto scrollbar"
        }
      >
        <h1 className="text-h6 sticky top-0 bg-black-200 pt-[32px]">
          Notifications
        </h1>
        <ul
          data-testid="ntfctn-mdl-ulst"
          className={
            "flex flex-col gap-[12px] box-border scrollbar" +
            " bg-black-400 w-full max-h-full p-[16px] rounded-[4px]"
          }
        >
          {notifications && notifications?.length > 0 ? (
            notifications.map((notification) => {
              if (
                notification.type === "COMMUNITYREQUEST" ||
                notification.type === "FRIENDREQUEST"
              ) {
                return (
                  <NotificationRequestItem
                    key={notification.id}
                    notification={notification}
                  />
                );
              }
            })
          ) : (
            <li>No notifications yet</li>
          )}
          <div ref={nextObserverRef}></div>
        </ul>
      </article>
    </div>
  );
};

export default NotificationModal;
