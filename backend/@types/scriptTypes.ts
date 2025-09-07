import { Community, Inbox, User } from "@prisma/client";

type CommunityWithOwnerAndInbox = Community & {
  inbox: Inbox | null;
  owner?: User | null;
};

export type { CommunityWithOwnerAndInbox };
