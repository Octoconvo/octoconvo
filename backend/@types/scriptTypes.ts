import { Community, Inbox, User } from "@prisma/client";

type CommunityWithOwnerAndInbox = Community & {
  inbox: Inbox | null;
  owner?: User | null;
};

type CommunitiesWithOwnerAndIInbox = CommunityWithOwnerAndInbox[];

export type { CommunityWithOwnerAndInbox, CommunitiesWithOwnerAndIInbox };
