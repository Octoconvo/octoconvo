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
  inbox: {
    id: string;
    inboxType: "COMMUNITY" | "DM";
    communityId: null | string;
    directMessageId: null | string;
  };
};

type CommunityResponseGET = {
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

export type { CommunityResponsePOST, CommunitiesResponseGET, CommunityResponseGET };
