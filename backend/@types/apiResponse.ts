import { Notification, User } from "@prisma/client";
import { UserFriendData } from "./database";
import type { DirectMessage, Inbox, Message } from "@prisma/client";

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

type Recipient = Pick<User, "id" | "username" | "displayName" | "avatar">;

type LastMessage = Pick<Message, "content"> | null;

type UserDMsGETResponse = DirectMessage & {
  inbox: Pick<Inbox, "id"> | null;
  recipient: Recipient;
  lastMessage: LastMessage;
};

export type {
  CommunityPOST,
  NotificationRes,
  ProfileRes,
  LastMessage,
  UserFriendsGETResponse,
  UserDMsGETResponse,
};
