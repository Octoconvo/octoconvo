import {
  getProfilesFromAPI,
  getProfilesFromAPIWithCursor,
} from "@/api/profile";
import { ProfileAPI } from "@/types/api";

const profile: ProfileAPI = {
  id: "testprofile1",
  username: "testprofile1",
  displayName: "testprofile1",
  avatar: null,
  bio: null,
  banner: null,
  isDeleted: false,
  lastSeen: "testprofile1",
  createdAt: "testprofile1",
  updatedAt: "testprofile1",
};
const message = "Successfully fetched Data";
const nextCursor = "testnextCursor1";

global.fetch = jest.fn((_url) =>
  Promise.resolve({
    status: 200,
    json: () =>
      Promise.resolve({
        nextCursor: nextCursor,
        profiles: [profile],
        message,
      }),
  })
) as jest.Mock;

describe("Test getProfilesFromAPI", () => {
  test("getProfilesFromAPI return the correct data", async () => {
    const getProfilesResponse = await getProfilesFromAPI({
      name: "testname1",
    });

    expect(getProfilesResponse).toStrictEqual({
      message,
      status: 200,
      profiles: [profile],
      nextCursor,
    });
  });
});

describe("Test getProfilesFromAPIWitthCursor", () => {
  test("getProfilesFromAPIWithCursor return the correct data", async () => {
    const getProfilesResponse = await getProfilesFromAPIWithCursor({
      name: "testname1",
      cursor: "testcursor1",
    });

    expect(getProfilesResponse).toStrictEqual({
      message,
      status: 200,
      profiles: [profile],
      nextCursor,
    });
  });
});
