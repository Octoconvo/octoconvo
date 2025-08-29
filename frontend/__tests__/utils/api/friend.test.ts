import { FriendAPI, NotificationAPI } from "@/types/api";
import {
  getFriendshipStatusFromAPI,
  postFriendRequestUpdateToAPI,
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

const notification: NotificationAPI = {
  id: "testnotification1",
  triggeredById: "testnotification1",
  triggeredBy: {
    username: "testnotification1",
  },
  triggeredForId: "testnotification1",
  triggeredFor: {
    username: "testnotification1",
  },
  isRead: false,
  createdAt: "testnotification1",
  community: null,
  communityId: null,
  payload: "testnotification1",
  status: "PENDING",
  type: "FRIENDREQUEST",
};

const newNotification = notification;

global.fetch = jest.fn((_url: string) => {
  const paths = _url.split("/");
  const lastPath = paths[paths.length - 1].split("?")[0];
  const isFriend = lastPath === "friend";
  const isFriendRequest = lastPath === "request";
  const isFriendshipStatus = lastPath === "friendship-status";

  console.log({ lastPath });
  return Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        message,
        ...(isFriendshipStatus ? { friendshipStatus } : {}),
        ...(isFriend ? { friends } : {}),
        ...(isFriendRequest ? { friends, notification, newNotification } : {}),
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

describe("Test postFriendRequestUpdateToAPI", () => {
  test("postFriendRequestUpdateToAPI return the correct data", async () => {
    const formData = new URLSearchParams();
    const postFriendRequestUpdateToAPIData = await postFriendRequestUpdateToAPI(
      {
        formData,
      }
    );

    expect(postFriendRequestUpdateToAPIData).toStrictEqual({
      message,
      status: 200,
      friends,
      notification,
      newNotification,
    });
  });
});
