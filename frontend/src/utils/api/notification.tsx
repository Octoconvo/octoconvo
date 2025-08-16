import { NotificationGET } from "@/types/api";

const notificationCountGET = async ({
  successHandler,
}: {
  successHandler: ({ data }: { data: number }) => void;
}) => {
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
      successHandler({ data: resData.unreadNotificationCount });
    }
  } catch (err) {
    if (err instanceof Error) console.log(err.message);
  }
};

const notificationsReadStatusPOST = async ({
  notifications,
  onSuccess,
}: {
  notifications: NotificationGET[];
  onSuccess: ({ data }: { data: NotificationGET[] }) => void;
}) => {
  const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

  const firstNotification = notifications[0];
  const lastNotification = notifications[notifications.length - 1];

  try {
    const formData = new URLSearchParams();
    formData.append("startdate", firstNotification.createdAt);
    formData.append("enddate", lastNotification.createdAt);

    const res = await fetch(
      `${domainURL}/notifications/update-read-status?mode=SILENT`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded ",
        },
      }
    );

    const resData = await res.json();

    if (res.status >= 400) {
      console.log(resData.message);
    }

    if (res.status >= 200 && res.status <= 300) {
      onSuccess({ data: resData.notifications });
    }
  } catch (err) {
    if (err instanceof Error) console.log(err.message);
  }
};

export { notificationCountGET, notificationsReadStatusPOST };
