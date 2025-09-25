import { randomUUID } from "crypto";
import {
  UserFriendConstructor,
  UserFriendMockI,
  FriendStatus,
  Friend,
} from "@/types/tests/mocks";

const createMockURL = (path: string) => {
  return `blob: https://${path}`;
};

class UserFriendMock implements UserFriendMockI {
  status: FriendStatus;
  createdAt: string;
  updatedAt: string;
  friendId: string;
  friendOfId: string;
  friend: Friend;

  constructor({
    username,
    displayName,
    status,
    avatar,
  }: UserFriendConstructor) {
    this.status = status || "PENDING";
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.friendOfId = randomUUID();
    this.friendId = randomUUID();
    this.friend = {
      username: username,
      displayName: displayName,
      avatar: avatar ? createMockURL(`${avatar}`) : null,
    };
  }
}

export { createMockURL, UserFriendMock };
