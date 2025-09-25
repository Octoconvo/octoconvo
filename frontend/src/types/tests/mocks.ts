type FriendStatus = "PENDING" | "ACTIVE";

interface Friendship {
  status: FriendStatus;
  readonly createdAt: string;
  updatedAt: string;
  readonly friendOfId: string;
  readonly friendId: string;
}

interface Friend {
  username: string;
  displayName: string;
  avatar: string | null;
}

interface UserFriendMockI extends Friendship {
  friend: Friend;
}

interface UserFriendConstructor {
  username: string;
  displayName: string;
  status?: FriendStatus;
  avatar?: string | null;
}

export type { Friend, FriendStatus, UserFriendConstructor, UserFriendMockI };
