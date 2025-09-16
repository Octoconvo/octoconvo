import { ParticipantStatus, User } from "@prisma/client";
import {
  addMemberToCommunity,
  getCommunityWithOwnerAndInboxByName,
  getUserByUsername,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/error";
import {
  CommunityWithOwnerAndInbox,
  SeedUserGenerator,
} from "../@types/scriptTypes";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import { generateSeedUserGenerators } from "../utils/scriptUtils";

const isNotOwner = (userId: string, ownerId: string): boolean => {
  return userId !== ownerId;
};

type GenerateCommunityParticipant = {
  userId: string;
  communityId: string;
  status: ParticipantStatus;
  count: number;
};

const generateCommunityParticipant = async ({
  userId,
  communityId,
  status,
  count,
}: GenerateCommunityParticipant) => {
  try {
    await addMemberToCommunity({
      communityId,
      userId,
      status,
      count,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

type IncrementPendingParticipantsCount = {
  pendingParticipantsCount: number;
  status: ParticipantStatus;
};

const incrementPendingParticipantsCount = ({
  pendingParticipantsCount,
  status,
}: IncrementPendingParticipantsCount) => {
  let pendingParticipantsCountCopy = pendingParticipantsCount;

  if (status === "PENDING") {
    pendingParticipantsCountCopy++;
  }

  return pendingParticipantsCountCopy;
};

type IncrementActiveParticipantsCount = {
  activeParticipantsCount: number;
  status: ParticipantStatus;
};

const incrementActiveParticipantsCount = ({
  activeParticipantsCount,
  status,
}: IncrementActiveParticipantsCount) => {
  let activeParticipantsCountCopy = activeParticipantsCount;

  if (status === "ACTIVE") {
    activeParticipantsCountCopy++;
  }

  return activeParticipantsCountCopy;
};

type GenerateCommunityParticipants = {
  users: User[];
  community: CommunityWithOwnerAndInbox;
  size: number;
};

const generateCommunityParticipants = async ({
  users,
  community,
  size,
}: GenerateCommunityParticipants) => {
  let activeParticipantsCount = 0;
  let pendingParticipantsCount = 0;

  logPopulateMessage(`Creating ${size} participants for ${community.name}...`);
  for (let i = 0; i < size; i++) {
    const userId: string = users[i].id;
    const ownerId: string = community.owner?.id || "";
    const status: ParticipantStatus = i % 2 === 0 ? "PENDING" : "ACTIVE";
    const count = status === "ACTIVE" ? 1 : 0;

    if (ownerId && isNotOwner(userId, ownerId)) {
      await generateCommunityParticipant({
        userId,
        communityId: community.id,
        status,
        count,
      });

      activeParticipantsCount = incrementActiveParticipantsCount({
        activeParticipantsCount,
        status,
      });

      pendingParticipantsCount = incrementPendingParticipantsCount({
        pendingParticipantsCount,
        status,
      });
    }
  }

  const totalParticipantsCount =
    activeParticipantsCount + pendingParticipantsCount;

  logPopulateSuccessMessage(
    `Successfully created ${activeParticipantsCount} active participants and` +
      ` ${pendingParticipantsCount} pending participants for` +
      ` ${community.name}. \nTOTAL: ${totalParticipantsCount}`,
  );
};

type IsWithinBoundaary = {
  start: number;
  end: number;
  toCompare: number;
};

const isWithinBoundary = ({
  start,
  end,
  toCompare,
}: IsWithinBoundaary): boolean => {
  return toCompare > start && toCompare <= end;
};

type PopulateCommunitiesParticipants = {
  communities: CommunityWithOwnerAndInbox[];
  users: User[];
};

const populateCommunitiesParticipants = async ({
  communities,
  users,
}: PopulateCommunitiesParticipants) => {
  const start = Math.floor(users.length / 4);
  const end = users.length - start;

  const createCommunitiesParticipantsPromises = communities.map(
    async (community, index) => {
      if (isWithinBoundary({ start, end, toCompare: index })) {
        await generateCommunityParticipants({
          users,
          community,
          size: index,
        });
      }
    },
  );

  await Promise.all(createCommunitiesParticipantsPromises);
};

type GetUsersAndCommunitiesData = {
  users: User[];
  communities: CommunityWithOwnerAndInbox[];
};

const getUsersAndCommunities = async (
  seedUserGenerators: SeedUserGenerator[],
): Promise<GetUsersAndCommunitiesData> => {
  const users: User[] = [];
  const communities: CommunityWithOwnerAndInbox[] = [];

  for (const seedUserGenerator of seedUserGenerators) {
    const user = await getUserByUsername(seedUserGenerator.username);
    const community = await getCommunityWithOwnerAndInboxByName(
      seedUserGenerator.community,
    );

    if (user) {
      users.push(user);
    }

    if (community) {
      communities.push(community);
    }
  }

  return {
    users,
    communities,
  };
};

const populateParticipantsDB = async (size: number) => {
  try {
    const seedUserGenerators = generateSeedUserGenerators(size);
    const { users: seedUsers, communities: seedCommunities } =
      await getUsersAndCommunities(seedUserGenerators);

    await populateCommunitiesParticipants({
      communities: seedCommunities,
      users: seedUsers,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateParticipantsDB };
