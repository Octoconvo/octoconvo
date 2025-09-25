import { ValidationError } from "./form";

type CommunityAPI = {
  id: string;
  name: string;
  bio: null | string;
  avatar: null | string;
  banner: null | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  inbox: {
    id: string;
    inboxType: "COMMUNITY" | "DM";
    communityId: null | string;
    directMessageId: null | string;
  };
};

type CommunityExploreAPI = {
  id: string;
  name: string;
  bio: null | string;
  avatar: null | string;
  banner: null | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    participants: number;
  };
};

type AttachmentAPI = {
  id: string;
  messageId: string | null;
  type: "IMAGE";
  subType: "JPEG" | "PNG" | "GIF";
  height: number;
  width: number;
  url: string;
  thumbnailUrl: string;
};

type InboxMessageAPI = {
  id: string;
  inboxId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isRead: boolean;
  hiddenFromAuthor: boolean;
  hiddenFromRecipient: boolean;
  replyToId: null | string;
  author: {
    username: string;
    displayName: string;
    avatar: null | string;
  };
  attachments: AttachmentAPI[];
};

type ParticipantAPI = {
  id: string;
  userId: string;
  role: "MEMBER" | "OWNER";
  status: "PENDING" | "ACTIVE";
  communityId: null | string;
  directMessageId: null | string;
  createdAt: string;
  updatedAt: string;
  memberSince: null | string;
};

type NotificationAPI = {
  id: string;
  triggeredById: string;
  triggeredBy: {
    username: string;
  };
  triggeredForId: string;
  triggeredFor: {
    username: string;
  };
  isRead: boolean;
  createdAt: string;
  type: "COMMUNITYREQUEST" | "FRIENDREQUEST" | "REQUESTUPDATE";
  status: "PENDING" | "REJECTED" | "ACCEPTED" | "COMPLETED";
  payload: string;
  communityId: null | string;
  community: null | {
    name: string;
  };
};

type ProfileAPI = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  banner: string | null;
  isDeleted: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
};

type ProfilesAPI = ProfileAPI[];

type ErrorAPI = {
  message?: string;
  validationErrors: ValidationError[];
};

type FriendAPI = {
  status: "PENDING" | "ACTIVE";
  createdAt: string;
  updatedAt: string;
  friendOfId: string;
  friendId: string;
};

type UserFriendAPI = FriendAPI & {
  friend: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
};

export type {
  CommunityAPI,
  CommunityExploreAPI,
  ParticipantAPI,
  InboxMessageAPI,
  AttachmentAPI,
  NotificationAPI,
  ProfileAPI,
  ProfilesAPI,
  ErrorAPI,
  FriendAPI,
  UserFriendAPI,
};
