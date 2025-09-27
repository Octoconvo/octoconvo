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

interface ConfigMock {
  method?: "POST" | "GET";
  mode?: "no-cors" | "cors";
  credentials?: "include";
  body?: FormData;
}

interface ResponseDataMock<Data> {
  status: number;
  data: Data;
  error: string | null;
}

interface GetData<Data> {
  (url?: string, config?: ConfigMock): ResponseDataMock<Data>;
}

interface ResponseMock<Data> {
  getData: GetData<Data>;
}

export type {
  Friend,
  FriendStatus,
  UserFriendConstructor,
  UserFriendMockI,
  ResponseDataMock,
  ResponseMock,
  ConfigMock,
  GetData,
};
