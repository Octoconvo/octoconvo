interface UserValue {
  id: string;
  username: string;
  displayName: string;
  password: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  isDeleted: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default UserValue;
