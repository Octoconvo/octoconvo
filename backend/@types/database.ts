import {
  DirectMessage,
  Friend,
  Inbox,
  Message,
  Participant,
  User,
} from "@prisma/client";

type UserFriendData = Friend & {
  friend: {
    username: string;
  };
};

type UserDMData = DirectMessage & {
  inbox: (Pick<Inbox, "id"> & { messages: Pick<Message, "content">[] }) | null;
  participants: (Pick<Participant, "id"> & {
    user: Pick<User, "id" | "username" | "displayName" | "avatar">;
  })[];
};

export type { UserFriendData, UserDMData };
