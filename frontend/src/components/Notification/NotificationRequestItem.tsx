"use client";

import { NotificationGET } from "@/types/response";
import { unescapeString, capitaliseStringFirstLetter } from "@/utils/string";
import RequestActionBtn from "./RequestActionBtn";
import { useCallback } from "react";

const NotificationRequestItem = ({
  notification,
  updateNotification,
}: {
  notification: NotificationGET;
  updateNotification: (notification: NotificationGET) => void;
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

  return (
    <li
      data-testid="ntfctn-rqst-itm"
      className={
        "flex flex-col gap-[16px] p-[16px] rounded-[4px] w-full" +
        (notification.isRead ? " bg-gr-black-1-b" : " bg-brand-1-2")
      }
    >
      <p
        data-testid="ntfctn-rqst-itm-msg"
        className=" max-w-full text-p font-regular"
      >
        <span
          data-testid="ntfctn-rqst-itm-msg-usr-usrnm"
          className="break-words font-bold text-white-100"
        >
          {notification.triggeredBy.username}
        </span>
        <span
          data-testid="ntfctn-rqst-itm-msg-pyld"
          className="font-regular text-white-200 "
        >
          {" " + notification.payload + " "}
        </span>
        <span
          data-testid="ntfctn-rqst-itm-msg-cmmnty-nm"
          className="break-words font-bold text-white-100"
        >
          {notification.type === "COMMUNITYREQUEST" &&
            notification.community &&
            unescapeString(notification.community.name)}
        </span>
      </p>
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
            onSubmit={communityActionOnSubmit}
          />
          <RequestActionBtn
            isRead={notification.isRead}
            action="REJECT"
            onSubmit={communityActionOnSubmit}
          />
        </div>
      )}
    </li>
  );
};

export default NotificationRequestItem;
