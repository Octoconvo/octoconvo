type CommunityPOST = {
  name: string;
  bio: string | null;
  avatar: string | null;
  id: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export { CommunityPOST };
