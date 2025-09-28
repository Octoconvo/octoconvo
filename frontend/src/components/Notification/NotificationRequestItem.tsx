"use client";

import { NotificationAPI } from "@/types/api";
import { capitaliseStringFirstLetter } from "@/utils/stringUtils";
import RequestActionBtn from "./RequestActionBtn";
import { useCallback } from "react";
import Payload from "./Payload";
import { postFriendRequestUpdateToAPI } from "@/utils/api/friend";

const NotificationRequestItem = ({
  notification,
  updateNotification,
}: {
  notification: NotificationAPI;
  updateNotification: (notification: NotificationAPI) => void;
}) => {
  const communityId = notification.communityId ? notification.communityId : " ";
  const notificationId = notification.id;
  // Perform ACCEPT or REJECT action on community request
  const communityActionOnSubmit = useCallback(
    async (action: "ACCEPT" | "REJECT") => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const formData = new URLSearchParams();
        formData.append("communityid", communityId),
          formData.append("notificationid", notificationId),
          formData.append("action", action);

        const response = await fetch(
          `${domainURL}/community/${communityId}/request`,
          {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: formData,
          }
        );

        const responseData = await response.json();

        if (response.status < 400) {
          updateNotification(responseData.notification);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    },
    []
  );

  type Action = "ACCEPT" | "REJECT";

  const friendRequestUpdateOnSubmit = async (action: Action) => {
    const formData = new URLSearchParams();
    formData.append("notificationid", notificationId);
    formData.append("action", action);

    try {
      const { notification } = await postFriendRequestUpdateToAPI({ formData });

      if (notification) {
        updateNotification(notification);
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  return (
    <li
      data-testid="ntfctn-rqst-itm"
      className={
        "flex flex-col gap-[16px] p-[16px] rounded-[4px] w-full" +
        (notification.isRead ? " bg-gr-black-1-b" : " bg-brand-1-2")
      }
    >
      {notification.type === "COMMUNITYREQUEST" && notification.communityId && (
        <Payload
          triggeredBy={notification.triggeredBy.username}
          triggeredFor={notification.community?.name || null}
          payload={notification.payload}
        />
      )}
      {notification.type === "REQUESTUPDATE" && (
        <Payload
          triggeredBy={notification.community?.name || ""}
          triggeredFor={null}
          payload={notification.payload}
        />
      )}

      {notification.type === "FRIENDREQUEST" && (
        <Payload
          triggeredBy={notification.triggeredBy.username}
          triggeredFor={null}
          payload={notification.payload}
        />
      )}
      {(notification.status === "REJECTED" ||
        notification.status === "ACCEPTED") && (
        <p
          data-testid="ntfctn-rqst-itm-sts-updt"
          className={
            notification.status === "REJECTED" ? "text-invalid" : "text-brand-4"
          }
        >
          {capitaliseStringFirstLetter(notification.status)}
        </p>
      )}
      {notification.status === "PENDING" && (
        <div
          data-testid="ntfctn-rqst-itm-btn-lst"
          className="flex gap-[16px] self-end"
        >
          <RequestActionBtn
            isRead={notification.isRead}
            action="ACCEPT"
            onSubmit={
              notification.type === "COMMUNITYREQUEST"
                ? communityActionOnSubmit
                : friendRequestUpdateOnSubmit
            }
          />
          <RequestActionBtn
            isRead={notification.isRead}
            action="REJECT"
            onSubmit={
              notification.type === "COMMUNITYREQUEST"
                ? communityActionOnSubmit
                : friendRequestUpdateOnSubmit
            }
          />
        </div>
      )}
    </li>
  );
};

export default NotificationRequestItem;
