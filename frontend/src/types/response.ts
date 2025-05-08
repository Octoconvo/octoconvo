type CommunityResponsePOST = {
  id: string;
  name: string;
  bio: null | string;
  avatar: null | string;
  banner: null | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type CommunitiesResponseGET = {
  id: string;
  name: string;
  bio: null | string;
  avatar: null | string;
  banner: null | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type { CommunityResponsePOST, CommunitiesResponseGET };
