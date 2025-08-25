import { ErrorAPI, FriendAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetFriendshipStatusFromAPI = {
  username: string;
};

type GetFriendshipStatusFromAPIData = {
  status: number;
  message: string;
  error?: ErrorAPI;
  friendshipStatus?: "NONE" | "PENDING" | "ACTIVE";
};

const getFriendshipStatusFromAPI = async ({
  username,
}: GetFriendshipStatusFromAPI): Promise<GetFriendshipStatusFromAPIData> => {
  const response = await fetch(
    `${DOMAIN_URL}/friend/friendship-status?username=${username}`,
    {
      method: "GET",
      credentials: "include",
      mode: "cors",
    }
  );

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

type PostFriendToAPI = {
  formData: URLSearchParams;
};

type PostFriendToAPIData = {
  status: number;
  message: string;
  error?: ErrorAPI;
  friends: FriendAPI[];
};

const postFriendToAPI = async ({
  formData,
}: PostFriendToAPI): Promise<PostFriendToAPIData> => {
  const response = await fetch(`${DOMAIN_URL}/friend`, {
    method: "POST",
    credentials: "include",
    mode: "cors",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

export { getFriendshipStatusFromAPI, postFriendToAPI };
