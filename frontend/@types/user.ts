type User = {
  id: string;
};

type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  isDeleted: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
};

export type { User, UserProfile };
