import {
  getCommunitiesFromAPI,
  getCommunitiesFromAPIWithCursor,
} from "@/api/community";
import { CommunityExploreGET } from "@/types/response";

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

const message = "Successfully fetched data";
const nextCursor = "testnextcursor1";

global.fetch = jest.fn((_url) =>
  Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        nextCursor: nextCursor,
        communities: [community],
        message,
      }),
  })
) as jest.Mock;

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
