import { Friend } from "@prisma/client";

type UserFriendData = Friend & {
  friend: {
    username: string;
  };
};

export type { UserFriendData };
