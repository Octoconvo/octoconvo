import { Community, Inbox, User } from "@prisma/client";

type CommunityWithOwnerAndInbox = Community & {
  inbox: Inbox | null;
  owner?: User | null;
};

type CommunitiesWithOwnerAndIInbox = CommunityWithOwnerAndInbox[];

type SeedUserGenerator = {
  username: string;
  displayName: string;
  password: string;
  community: string;
};

export type {
  CommunityWithOwnerAndInbox,
  CommunitiesWithOwnerAndIInbox,
  SeedUserGenerator,
};
