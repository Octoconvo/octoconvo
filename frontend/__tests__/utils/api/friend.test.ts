import { getFriendshipStatusFromAPI } from "@/utils/api/friend";

const message = "Successfully fetched data";
const friendshipStatus = "ACTIVE";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

global.fetch = jest.fn((_url: string) => {
  return Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        message,
        friendshipStatus,
      }),
  });
}) as jest.Mock;

describe("Test getFriendshipStatusFromAPI", () => {
  test("getFriendshipStatusFromAPI return the correct data", async () => {
    const GetFriendshipStatusFromAPIData = await getFriendshipStatusFromAPI({
      username: "testusername1",
    });

    expect(GetFriendshipStatusFromAPIData).toStrictEqual({
      message,
      status: 200,
      friendshipStatus,
    });
  });

  test(
    "getFriendshipStatusFromAPI to be called with the correct" +
      " url and method",
    async () => {
      await getFriendshipStatusFromAPI({
        username: "testusername1",
      });

      expect(fetch).toHaveBeenCalledWith(
        `${DOMAIN_URL}/friend/friendship-status?username=testusername1`,
        { credentials: "include", method: "GET", mode: "cors" }
      );
    }
  );
});
