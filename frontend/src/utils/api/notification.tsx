import { ErrorAPI, NotificationAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetNotificationCountFromAPIData = {
  status: number;
  unreadNotificationCount?: number;
  error?: ErrorAPI;
};

type PostNotificationsReadStatusesToAPI = {
  formData: URLSearchParams;
};

type PostNotificationsReadStatusesToAPIData = {
  message: string;
  status: number;
  notifications: NotificationAPI[];
  error?: ErrorAPI;
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

const postNotificationsReadStatusesToAPI = async ({
  formData,
}: PostNotificationsReadStatusesToAPI): // eslint-disable-next-line
Promise<PostNotificationsReadStatusesToAPIData> => {
  const response = await fetch(
    `${DOMAIN_URL}/notifications/update-read-status?mode=SILENT`,
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

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

export { getNotificationCountFromAPI, postNotificationsReadStatusesToAPI };
