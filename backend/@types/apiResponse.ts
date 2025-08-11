import { Notification, User } from "@prisma/client";

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

export { CommunityPOST, NotificationRes, ProfileRes };
