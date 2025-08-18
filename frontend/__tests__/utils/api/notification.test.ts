import { getNotificationCountFromAPI } from "@/utils/api/notification";

const unreadNotificationCount = 1;

const message = "Successfully fetched data";

const getNotificationCountFromAPIData = {
  message,
  unreadNotificationCount,
};

global.fetch = jest.fn((_url: string) => {
  const isNotificationCount = _url.split("/").includes("unread-count");

  return Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        message,
        ...(isNotificationCount ? getNotificationCountFromAPIData : {}),
      }),
  });
}) as jest.Mock;

describe("Test getNotificationCountFromAPI", () => {
  test("getNotificationCountFromAPI return the correct data", async () => {
    const getNotificationCountFromAPIData = await getNotificationCountFromAPI();

    expect(getNotificationCountFromAPIData).toStrictEqual({
      message,
      status: 200,
      unreadNotificationCount,
    });
  });
});
