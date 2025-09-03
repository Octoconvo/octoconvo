import { Notification, User } from "@prisma/client";
import { UserFriendData } from "./database";

type CommunityPOST = {
  name: string;
  bio: string | null;
  avatar: string | null;
  id: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NotificationRes = Notification & {
  triggeredBy: {
    username: string;
  };
  triggeredFor: {
    username: string;
  };
  community: null | {
    name: string;
  };
};

type ProfileRes = Omit<User, "password">;

type UserFriendsGETResponse = {
  message: string;
  friends: UserFriendData[];
  nextCursor: false | string;
};

export { CommunityPOST, NotificationRes, ProfileRes, UserFriendsGETResponse };
