import { ParticipantStatus } from "@prisma/client";
import {
  addMemberToCommunity,
  getCommunityWithOwnerAndInboxByName,
  getUserByUsername,
} from "../database/prisma/scriptQueries";
import { logErrorMessage } from "../utils/loggerUtils";
import { SeedUserGenerator } from "../@types/scriptTypes";
import {
  logPopulateMessage,
  logPopulateSuccessMessage,
} from "../utils/loggerUtils";
import { generateSeedUserGenerators } from "../utils/scriptUtils";
import { breakArrayIntoSubArrays } from "../utils/array";

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
  seedUserGenerators: SeedUserGenerator[];
  communityName: string;
  size: number;
};

const generateCommunityParticipants = async ({
  seedUserGenerators,
  communityName,
  size,
}: GenerateCommunityParticipants) => {
  logPopulateMessage(`Creating ${size} participants for ${communityName}...`);
  let activeParticipantsCount = 0;
  let pendingParticipantsCount = 0;

  const community = await getCommunityWithOwnerAndInboxByName(communityName);
  for (let i = 0; i < size; i++) {
    const user = await getUserByUsername(seedUserGenerators[i].username);
    const userId: string = user?.id || "";
    const ownerId: string = community?.owner?.id || "";
    const status: ParticipantStatus = i % 2 === 0 ? "PENDING" : "ACTIVE";
    const count = status === "ACTIVE" ? 1 : 0;

    if (ownerId && userId && community && isNotOwner(userId, ownerId)) {
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
      ` ${communityName}. \nTOTAL: ${totalParticipantsCount}`,
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

type CreateCreateParticipantsPromises = {
  seedUserGenerators: SeedUserGenerator[];
  seedUserGeneratorsSubArray: SeedUserGenerator[];
};

const createCreateParticipantsPromises = ({
  seedUserGenerators,
  seedUserGeneratorsSubArray,
}: CreateCreateParticipantsPromises) => {
  return seedUserGeneratorsSubArray.map(async seedUserGenerator => {
    const start = Math.floor(seedUserGenerators.length / 4);
    const end = seedUserGenerators.length - start;
    const currentIndex = seedUserGenerators.findIndex(
      item => item.community === seedUserGenerator.community,
    );
    if (isWithinBoundary({ start, end, toCompare: currentIndex })) {
      await generateCommunityParticipants({
        seedUserGenerators,
        communityName: seedUserGenerator.community,
        size: currentIndex,
      });
    }
  });
};

type PopulateCommunitiesParticipants = {
  seedUserGenerators: SeedUserGenerator[];
};

const populateCommunitiesParticipants = async ({
  seedUserGenerators,
}: PopulateCommunitiesParticipants) => {
  const seedUserGeneratorsSubArrays = breakArrayIntoSubArrays({
    array: seedUserGenerators,
    subArraySize: 100,
  });

  for (const seedUserGeneratorsSubArray of seedUserGeneratorsSubArrays) {
    await Promise.all(
      createCreateParticipantsPromises({
        seedUserGenerators,
        seedUserGeneratorsSubArray,
      }),
    );
  }
};

const populateParticipantsDB = async (size: number) => {
  try {
    const seedUserGenerators = generateSeedUserGenerators(size);
    await populateCommunitiesParticipants({
      seedUserGenerators,
    });
  } catch (err) {
    logErrorMessage(err);
  }
};

export { populateParticipantsDB };
