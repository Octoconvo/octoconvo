import {
  getCommunitiesFromAPI,
  getCommunitiesFromAPIWithCursor,
  getCommunityParticipationStatusFromAPI,
  postCommunityJoinToAPI,
} from "@/api/community";
import {
  CommunityExploreGET,
  CommunityJoinPOSTParticipant,
} from "@/types/response";

const community: CommunityExploreGET = {
  id: "testcommunity1",
  name: "testcommunity1",
  bio: null,
  avatar: null,
  banner: null,
  isDeleted: false,
  createdAt: "testcommunity1",
  updatedAt: "testcommunity1",
  _count: {
    participants: 1,
  },
};

const participant: CommunityJoinPOSTParticipant = {
  id: "testparticipant1",
  userId: "testparticipant1",
  role: "MEMBER",
  status: "PENDING",
  communityId: null,
  directMessageId: null,
  createdAt: "testparticipant1",
  updatedAt: "testparticipant1",
  memberSince: null,
};

const message = "Successfully fetched data";
const nextCursor = "testnextcursor1";

const getCommunitiesFromAPIResponse = {
  nextCursor: nextCursor,
  communities: [community],
};

const postCommunityJoinToAPIResponse = { participant: participant };

const getCommunityParticipationStatusFromAPIResponse = {
  participationStatus: "ACTIVE",
};

global.fetch = jest.fn((_url: string) => {
  const isCommunities = _url
    .split("/")
    .find((path) => path.split("?").includes("communities"));
  const isCommunityJoin = _url.split("/").includes("join");
  const isCommunityParticipationStatus = _url
    .split("/")
    .includes("participation-status");

  return Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        message,
        ...(isCommunities ? getCommunitiesFromAPIResponse : {}),
        ...(isCommunityJoin ? postCommunityJoinToAPIResponse : {}),
        ...(isCommunityParticipationStatus
          ? getCommunityParticipationStatusFromAPIResponse
          : {}),
      }),
  });
}) as jest.Mock;

describe("Test getCommunitiesFromAPI", () => {
  test("getCommunitiesFromAPI return the correct data", async () => {
    const getCommunitiesResponse = await getCommunitiesFromAPI({
      name: "testname1",
    });

    expect(getCommunitiesResponse).toStrictEqual({
      message,
      status: 200,
      communities: [community],
      nextCursor,
    });
  });
});

describe("Test getCommunitiesFromAPIWithCursor", () => {
  test("getCommunitiesFromAPIWithCursor return the correct data", async () => {
    const getCommunitiesResponse = await getCommunitiesFromAPIWithCursor({
      name: "testname1",
      cursor: "testcursor1",
    });

    expect(getCommunitiesResponse).toStrictEqual({
      message,
      status: 200,
      communities: [community],
      nextCursor,
    });
  });
});

describe("Test postCommunityJoinToAPI", () => {
  test("postCommunityJoinToAPI return the correct data", async () => {
    const postCommunityJoinToAPIResponse = await postCommunityJoinToAPI({
      communityId: "testcommunityid1",
    });

    expect(postCommunityJoinToAPIResponse).toStrictEqual({
      message,
      status: 200,
      participant,
    });
  });
});

describe("Test getCommunityParticipationStatusFromAPI", () => {
  test("getCommunityParticipationStatusFromAPI return the correct data", async () => {
    const getCommunityParticipationStatusFromAPIResponse =
      await getCommunityParticipationStatusFromAPI({
        communityId: "testcommunityid1",
      });

    expect(getCommunityParticipationStatusFromAPIResponse).toStrictEqual({
      message,
      status: 200,
      participationStatus: "ACTIVE",
    });
  });
});
