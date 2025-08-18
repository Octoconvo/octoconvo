import { NotificationAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetNotificationCountFromAPIData = {
  status: number;
  unreadNotificationCount?: number;
};

const getNotificationCountFromAPI =
  async (): Promise<GetNotificationCountFromAPIData> => {
    const response = await fetch(`${DOMAIN_URL}/notification/unread-count`, {
      credentials: "include",
      mode: "cors",
      method: "GET",
    });

    const responseData = await response.json();

    return {
      status: response.status,
      ...responseData,
    };
  };

const notificationsReadStatusPOST = async ({
  notifications,
  onSuccess,
}: {
  notifications: NotificationAPI[];
  onSuccess: ({ data }: { data: NotificationAPI[] }) => void;
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

export { getNotificationCountFromAPI, notificationsReadStatusPOST };
