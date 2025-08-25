import { FriendAPI } from "@/types/api";
import {
  getFriendshipStatusFromAPI,
  postFriendToAPI,
} from "@/utils/api/friend";

const message = "Successfully fetched data";
const friendshipStatus = "ACTIVE";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

const friend: FriendAPI = {
  friendOfId: "testfriend1",
  friendId: "testfriend1",
  createdAt: new Date().toISOString(),
  status: "PENDING",
  updatedAt: new Date().toISOString(),
};

const friends = [friend];

global.fetch = jest.fn((_url: string) => {
  const paths = _url.split("/");
  const lastPath = paths[paths.length - 1];
  const isFriend = lastPath === "friend";

  return Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        message,
        ...(!isFriend ? { friendshipStatus } : {}),
        ...(isFriend ? { friends } : {}),
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

describe("Test postFriendToAPI", () => {
  test("postFriendToAPI return the correct data", async () => {
    const formData = new URLSearchParams();
    const postFriendToAPIData = await postFriendToAPI({
      formData,
    });

    expect(postFriendToAPIData).toStrictEqual({
      message,
      status: 200,
      friends,
    });
  });
});
