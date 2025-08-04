import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import {
  deleteCommunityById,
  getCommunityByName,
} from "../../database/prisma/communityQueries";
import { CommunityPOST } from "../../@types/apiResponse";
import { Community, Inbox, Notification, Participant } from "@prisma/client";
import prisma from "../../database/prisma/client";

jest.mock("../../database/supabase/supabaseQueries", () => ({
  uploadFile: async ({
    folder,
    file,
    bucketName,
  }: {
    folder: string;
    file: Express.Multer.File;
    bucketName: string;
  }) => {
    const promiseData = {
      path: `${folder}/${file.originalname}`,
      fullPath: `${bucketName}/${folder}/${file.originalname}`,
    };

    type PromiseData = {
      data: { path: string; fullPath: string };
    };

    //eslint-disable-next-line
    const promise = new Promise<PromiseData>((resolve, reject) => {
      resolve({ data: promiseData });
    });

    const { data } = await promise.then(data => {
      return data;
    });

    return data;
  },
  getPublicURL: ({
    path,
    bucketName,
  }: {
    path: string;
    bucketName: string;
  }) => {
    path =
      bucketName === "banner"
        ? "513c920c-3921-48b2-88d7-5b8156b9e6b8/" +
          "image-887cc252-e94c-455f-bc99-4d5c7a0d8b47.png"
        : "513c920c-3921-48b2-88d7-5b8156b9e6b8/" +
          "image-7ee20129-ce65-43ce-b324-6c8cb514c1cd.png";
    return {
      publicUrl:
        "https://mqzsctdttuxrgvlpthvy.supabase.co/storage/v1/object/public/" +
        `${bucketName}/${path}`,
    };
  },
}));

// Set jest's timeout to 60 seconds
jest.setTimeout(60000);

describe("Test community post controller", () => {
  afterAll(() => {
    const communities = [
      "community_name_test",
      "community_name_test_1",
      "Community_name_test_2",
    ];

    communities.forEach(async item => {
      const community: null | CommunityPOST = await getCommunityByName(item);

      if (community) {
        try {
          await deleteCommunityById(community.id);
        } catch (err) {
          if (err instanceof Error) console.log(err.message);
        }
      }
    });
  });

  test(
    "Return 401 unauthorized if user tries to create a community without" +
      " being unauthenticated",
    done => {
      request(app)
        .post("/community")
        .type("form")
        .send({
          name: "test-community",
          bio: "This is the test bio.",
        })
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to create community",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Return 422 response when name field is empty", done => {
    agent
      .post("/community")
      .type("form")
      .send({
        name: "",
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create community");
        expect(error.validationError).toBeDefined();
        expect(error.validationError[0]).toEqual({
          value: "",
          field: "name",
          msg: "Community name is required",
        });
      })
      .expect(422, done);
  });

  test("Return 422 response when name field longer than 128 characters", done => {
    agent
      .post("/community")
      .type("form")
      .send({
        name: "a".repeat(129),
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create community");
        expect(error.validationError).toBeDefined();
        expect(error.validationError[0].msg).toBe(
          "Community name must not exceed 128 characters",
        );
      })
      .expect(422, done);
  });

  test("Return 422 response when name field longer than 255 characters", done => {
    agent
      .post("/community")
      .type("form")
      .send({
        name: "test",
        bio: "a".repeat(256),
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create community");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "bio",
          ).msg,
        ).toBe("Community bio must not exceed 255 characters");
      })
      .expect(422, done);
  });

  test("Failed to update avatar if image mimetype is invalid", done => {
    agent
      .post("/community")
      .set("Content-Type", "multipart/form-data")
      .accept("application/json")
      .field("name", "test")
      .attach("avatar", __dirname + "/../assets/test-img-invalid-01.svg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toEqual("Failed to create community");
        expect(error).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "avatar",
          ).msg,
        ).toEqual("Avatar must only be in jpeg or png format");
      })
      .expect(422)
      .end(done);
  });

  test("Failed to update banner if image mimetype is invalid", done => {
    agent
      .post("/community")
      .set("Content-Type", "multipart/form-data")
      .accept("application/json")
      .field("name", "test")
      .attach("banner", __dirname + "/../assets/test-img-invalid-01.svg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toEqual("Failed to create community");
        expect(error).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "banner",
          ).msg,
        ).toEqual("Banner must only be in jpeg or png format");
      })
      .expect(422)
      .end(done);
  });

  test("Successfully create community if avatar mimetype is valid", done => {
    agent
      .post("/community")
      .set("Content-Type", "multipart/form-data")
      .accept("application/json")
      .field({
        name: "community_name_test",
      })
      .attach("avatar", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const community = res.body.community;

        expect(message).toEqual("Successfully created community");
        expect(community).toBeDefined();
        expect(community.avatar).toBeDefined();
        expect(community.avatar).toBe(
          "https://mqzsctdttuxrgvlpthvy.supabase.co/storage/v1/object/public/" +
            "community-avatar/513c920c-3921-48b2-88d7-5b8156b9e6b8/" +
            "image-7ee20129-ce65-43ce-b324-6c8cb514c1cd.png",
        );
      })
      .expect(200)
      .end(done);
  });

  test("Successfully create community if all fields are valid", done => {
    agent
      .post("/community")
      .set("Content-Type", "multipart/form-data")
      .accept("application/json")
      .field({
        name: "community_name_test_1",
        bio: "community_bio_test",
      })
      .attach("banner", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const community = res.body.community;

        expect(message).toBeDefined();
        expect(message).toBe("Successfully created community");
        expect(community).toBeDefined();
        expect(community.id).toBeDefined();
        expect(message).toBe("Successfully created community");
      })
      .expect(200, done);
  });

  test(
    "Created community's owner participant is correct and created" +
      "and updated date is not null",
    done => {
      agent
        .post("/community")
        .set("Content-Type", "multipart/form-data")
        .accept("application/json")
        .field({
          name: "community_name_test_2",
          bio: "community_bio_test",
        })
        .attach("banner", __dirname + "/../assets/test-img-valid-01.jpg")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          console.log(res.body);
          const participants = res.body.community.participants;

          expect(participants).toBeDefined();
          expect(participants.length).toBe(1);
          expect(participants[0].role).toBe("OWNER");
          expect(participants[0].memberSince).toBeDefined();
          expect(participants[0].memberSince).not.toBeNull();
        })
        .expect(200, done);
    },
  );

  test("Failed to create community name is taken", done => {
    agent
      .post("/community")
      .set("Content-Type", "multipart/form-data")
      .accept("application/json")
      .field({
        name: "community_name_test_1",
        bio: "community_bio_test",
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBeDefined();
        expect(message).toBe("Failed to create community");
        expect(error).toBeDefined();
        expect(error.validationError[0].msg).toBe(
          "Community name is already taken",
        );
      })
      .expect(422, done);
  });
});

describe("Test Communities_get controller with seeduser1", () => {
  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Failed to fetch user's communities if user is unauthenticated", done => {
    request(app)
      .get("/communities")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch user's communities",
        error: {
          message: "You are not authenticated",
        },
      })
      .expect(401, done);
  });

  test("Successfully fetched user's communities if user is authenticated", done => {
    agent
      .get("/communities")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const communities = res.body.communities;

        expect(message).toBe("Successfully fetched user's communities");
        expect(Array.isArray(communities)).toBeTruthy();
      })
      .expect(200, done);
  });

  test("The returned community list's length should be correct", done => {
    agent
      .get("/communities")
      .expect("Content-Type", /json/)
      .expect(async (res: Response) => {
        const communities = res.body.communities;

        const userActiveParticipation = await prisma.participant.findMany({
          where: {
            user: {
              username: "seeduser1",
            },
            status: "ACTIVE",
          },
          include: {
            user: true,
          },
        });

        expect(communities.length).toBe(userActiveParticipation.length);
      })
      .expect(200, done);
  });
});

describe("Test Communities_get controller with seeduser100", () => {
  const agent = request.agent(app);

  login(agent, {
    username: "seeduser100",
    password: "seed@User100",
  });

  test("The returned community list's length should be correct", done => {
    agent
      .get("/communities")
      .expect("Content-Type", /json/)
      .expect(async (res: Response) => {
        const communities = res.body.communities;

        const userActiveParticipation = await prisma.participant.findMany({
          where: {
            user: {
              username: "seeduser100",
            },
            status: "ACTIVE",
          },
          include: {
            user: true,
          },
        });

        expect(communities.length).toBe(userActiveParticipation.length);
      })
      .expect(200, done);
  });
});

describe("Test Communities_get controller with seeduser50", () => {
  const agent = request.agent(app);

  login(agent, {
    username: "seeduser50",
    password: "seed@User50",
  });

  test("The returned community list's length should be correct", done => {
    agent
      .get("/communities")
      .expect("Content-Type", /json/)
      .expect(async (res: Response) => {
        const communities = res.body.communities;

        const userActiveParticipation = await prisma.participant.findMany({
          where: {
            user: {
              username: "seeduser50",
            },
            status: "ACTIVE",
          },
          include: {
            user: true,
          },
        });

        expect(communities.length).toBe(userActiveParticipation.length);
      })
      .expect(200, done);
  });
});

describe("Test community_get controller", () => {
  type CommunityGET = Community & {
    inbox: Inbox;
  };
  let community1: CommunityGET | null = null;

  beforeAll(async () => {
    try {
      community1 = (await prisma.community.findUnique({
        where: {
          name: "seedcommunity1",
        },
        include: {
          inbox: true,
        },
      })) as CommunityGET;
    } catch (err) {
      console.error(err);
    }
  });
  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Failed to fetch community if user is unauthenticated", done => {
    request(app)
      .get("/community/testcommunity1")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch community",
        error: {
          message: "You are not authenticated",
        },
      })
      .expect(401, done);
  });

  test("Return 422 HTTP error when community id is invalid", done => {
    agent
      .get("/community/testcommunity1")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch community");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "communityid",
          ).msg,
        ).toBe("Community id is invalid");
      })
      .expect(422, done);
  });

  test("Return 404 HTTP error when community doesn't exist", done => {
    agent
      .get(`/community/${community1?.inbox.id}`)
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch community",
        error: {
          message: "Community with that id doesn't exist",
        },
      })
      .expect(404, done);
  });

  test("Successfully fetched community if user is authenticated", done => {
    agent
      .get(`/community/${community1?.id}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const community = res.body.community;

        expect(message).toBe(
          `Successfully fetched community with id ${community1?.id}`,
        );
        expect(community.id).toBe(community1?.id);
        expect(community.inbox.id).toBe(community1?.inbox.id);
      })
      .expect(200, done);
  });
});

describe("Test communities_explore_get", () => {
  type CommunityExplore = Community & {
    _count: {
      participants: number;
    };
  };

  let seedCommunities: Community[] = [];
  let communityMiddle: CommunityExplore | null = null;
  let community10: CommunityExplore | null = null;

  beforeAll(async () => {
    try {
      seedCommunities = await prisma.community.findMany({
        where: {
          name: {
            startsWith: "seedcommunity",
          },
        },
      });

      const middleCommunity =
        seedCommunities.length % 2 === 0
          ? seedCommunities.length / 2
          : (seedCommunities.length - 1) / 2;

      communityMiddle = await prisma.community.findUnique({
        where: {
          name: `seedcommunity${middleCommunity}`,
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });

      community10 = await prisma.community.findUnique({
        where: {
          name: "seedcommunity10",
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Failed to fetch communities if user is unauthenticated", done => {
    request(app)
      .get("/explore/communities")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch communities",
        error: {
          message: "You are not authenticated",
        },
      })
      .expect(401, done);
  });

  test(
    "Return 422 HTTP error when the name query exceed" + " the maximum length",
    done => {
      agent
        .get(`/explore/communities?name=${"a".repeat(129)}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to fetch communities");
          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "name",
            ).msg,
          ).toBe("Community name must not exceed 128 characters");
        })
        .expect(422, done);
    },
  );

  test("Return 422 HTTP error when the name memberCount cursor is invalid", done => {
    const ISOString = communityMiddle?.createdAt
      ? new Date(communityMiddle?.createdAt).toISOString()
      : "";

    agent
      .get(`/explore/communities?cursor=testmembercount1_${ISOString}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch communities");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "cursor",
          ).msg,
        ).toBe("Cursor value is invalid");
      })
      .expect(422, done);
  });

  test("Return 422 HTTP error when the limit is a decimal value", done => {
    agent
      .get(`/explore/communities?limit=0.1`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch communities");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "limit",
          ).msg,
        ).toBe("Limit must be an integer between 1 and 100");
      })
      .expect(422, done);
  });

  test("Return 422 HTTP error when the limit is less than 1", done => {
    agent
      .get(`/explore/communities?limit=0`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch communities");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "limit",
          ).msg,
        ).toBe("Limit must be an integer between 1 and 100");
      })
      .expect(422, done);
  });

  test("Return 422 HTTP error when the limit is bigger than 100", done => {
    agent
      .get(`/explore/communities?limit=101`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch communities");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "limit",
          ).msg,
        ).toBe("Limit must be an integer between 1 and 100");
      })
      .expect(422, done);
  });

  test("Return correct communities with the name query", done => {
    agent
      .get("/explore/communities?name=community")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const communities = res.body.communities;

        expect(message).toBe("Successfully fetched communities");
        expect(communities).toBeDefined();
        for (const community of communities) {
          expect(community.name).toContain("community");
        }
      })
      .expect(200, done);
  });

  test(
    "Return less or equal than 30 communities when no query is" + " provided",
    done => {
      agent
        .get("/explore/communities")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const communities = res.body.communities;

          expect(message).toBe("Successfully fetched communities");
          expect(communities).toBeDefined();
          expect(communities.length).toBeLessThanOrEqual(30);
        })
        .expect(200, done);
    },
  );

  test("Return 3 communities when the limit is 3", done => {
    agent
      .get("/explore/communities?limit=3")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const communities = res.body.communities;

        expect(message).toBe("Successfully fetched communities");
        expect(communities).toBeDefined();
        expect(communities.length).toBe(3);
      })
      .expect(200, done);
  });

  test("Return the correct communities with cursor", done => {
    const ISOString = communityMiddle?.createdAt
      ? new Date(communityMiddle?.createdAt).toISOString()
      : "";
    const cursor =
      `${communityMiddle?._count.participants}` +
      "_" +
      `${communityMiddle?.id}` +
      "_" +
      ISOString;

    agent
      .get(`/explore/communities?limit=10&cursor=${cursor}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const communities = res.body.communities;
        const nextCursor = res.body.nextCursor;
        const error = res.body.error;

        expect(error).not.toBeDefined();
        expect(message).toBe("Successfully fetched communities");
        expect(communities).toBeDefined();
        expect(communities.length).toBe(10);
        expect(nextCursor).toBeDefined();

        type CommunityData = Community & {
          _count: {
            participants: number;
          };
        };

        communities.map((community: CommunityData) => {
          if (communityMiddle) {
            expect(Number(community._count.participants)).toBeLessThanOrEqual(
              Number(communityMiddle?._count.participants),
            );
          }
        });
      })
      .expect(200, done);
  });

  test("Return the correct nextCursor", done => {
    const ISOString = communityMiddle?.createdAt
      ? new Date(communityMiddle?.createdAt).toISOString()
      : "";
    const cursor =
      `${communityMiddle?._count.participants}` +
      "_" +
      `${communityMiddle?.id}` +
      "_" +
      ISOString;

    agent
      .get(`/explore/communities?limit=10&cursor=${cursor}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const communities = res.body.communities;
        const nextCursor = res.body.nextCursor;

        expect(message).toBe("Successfully fetched communities");
        expect(nextCursor).toBeDefined();

        const lastCommunity = communities[communities.length - 1];
        const ISOString = lastCommunity.createdAt
          ? new Date(lastCommunity.createdAt).toISOString()
          : "";

        const cursor =
          `${lastCommunity?._count.participants}` +
          "_" +
          `${lastCommunity?.id}` +
          "_" +
          ISOString;

        expect(nextCursor).toBe(cursor);
      })
      .expect(200, done);
  });

  test(
    "NextCursor should be false when the returned communities is" +
      " less than limit",
    done => {
      const ISOString = community10?.createdAt
        ? new Date(community10?.createdAt).toISOString()
        : "";
      const cursor =
        `${community10?._count.participants}` +
        "_" +
        `${community10?.id}` +
        "_" +
        ISOString;

      agent
        .get(
          `/explore/communities?name="seedcommunity"&limit=20&cursor=${cursor}`,
        )
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const nextCursor = res.body.nextCursor;

          expect(message).toBe("Successfully fetched communities");
          expect(nextCursor).toBeDefined();

          expect(nextCursor).toBe(false);
        })
        .expect(200, done);
    },
  );
});

describe("Test community_participation_status_get", () => {
  type CommunityData = Community & {
    inbox: Inbox;
  };
  let communityPending: CommunityData | null = null;
  let communityActive: CommunityData | null = null;
  let communityNone: CommunityData | null = null;

  beforeAll(async () => {
    try {
      const participantPending = await prisma.participant.findFirst({
        where: {
          user: {
            username: "seeduser1",
          },
          status: "PENDING",
        },
      });

      const participantActive = await prisma.participant.findFirst({
        where: {
          user: {
            username: "seeduser1",
          },
          status: "ACTIVE",
        },
      });

      if (participantPending && participantPending.communityId) {
        communityPending = (await prisma.community.findUnique({
          where: {
            id: participantPending.communityId,
          },
          include: {
            inbox: true,
          },
        })) as CommunityData;
      }

      if (participantActive && participantActive.communityId) {
        communityActive = (await prisma.community.findUnique({
          where: {
            id: participantActive.communityId,
          },
          include: {
            inbox: true,
          },
        })) as CommunityData;
      }

      communityNone = (await prisma.community.findFirst({
        where: {
          participants: {
            every: {
              NOT: {
                user: {
                  username: "seeduser1",
                },
              },
            },
          },
        },
        include: {
          inbox: true,
        },
      })) as CommunityData;
    } catch (err) {
      console.error(err);
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test(
    "Failed to fetch participation status if user is" + " unauthenticated",
    done => {
      request(app)
        .get(`/community/${communityPending?.id}/participation-status`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch your community participation status",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  test("Failed to fetch participation status if the community doesn't exist", done => {
    agent
      .get(`/community/${communityActive?.inbox.id}/participation-status`)
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch your community participation status",
        error: {
          message: "Community with that id doesn't exist",
        },
      })
      .expect(404, done);
  });

  test(
    "Return PENDING participation status when user is" +
      " a PENDIND participant",
    done => {
      agent
        .get(`/community/${communityPending?.id}/participation-status`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Successfully fetched your community participation status",
          participationStatus: "PENDING",
        })
        .expect(200, done);
    },
  );

  test(
    "Return ACTIVE participation status when user is" +
      " an ACTIVE participant",
    done => {
      agent
        .get(`/community/${communityActive?.id}/participation-status`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Successfully fetched your community participation status",
          participationStatus: "ACTIVE",
        })
        .expect(200, done);
    },
  );

  test(
    "Return NONE participation status when user is" +
      " an is not a participant of the community",
    done => {
      agent
        .get(`/community/${communityNone?.id}/participation-status`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Successfully fetched your community participation status",
          participationStatus: "NONE",
        })
        .expect(200, done);
    },
  );
});

describe("Test community_join_post", () => {
  type CommunityType = Community & {
    inbox: Inbox;
  };
  let communityNone: CommunityType | null = null;
  let communityActive: CommunityType | null = null;
  let communityPending: CommunityType | null = null;

  beforeAll(async () => {
    try {
      communityNone = (await prisma.community.findFirst({
        where: {
          participants: {
            every: {
              NOT: {
                user: {
                  username: "seeduser1",
                },
              },
            },
          },
        },
        include: {
          inbox: true,
        },
      })) as CommunityType;

      communityActive = (await prisma.community.findFirst({
        where: {
          participants: {
            some: {
              user: {
                username: "seeduser1",
              },
              status: "ACTIVE",
            },
          },
        },
        include: {
          inbox: true,
        },
      })) as CommunityType;

      communityPending = (await prisma.community.findFirst({
        where: {
          participants: {
            some: {
              user: {
                username: "seeduser1",
              },
              status: "PENDING",
            },
          },
        },
        include: {
          inbox: true,
        },
      })) as CommunityType;
    } catch (err) {
      console.error(err);
    }
  });

  afterEach(async () => {
    if (communityNone?.id) {
      const participants = await prisma.participant.findMany({
        where: {
          user: {
            username: "seeduser1",
          },
          communityId: communityNone.id,
        },
      });

      const notifications = await prisma.notification.findMany({
        where: {
          type: "COMMUNITYREQUEST",
          triggeredBy: {
            username: "seeduser1",
          },
          communityId: communityNone.id,
        },
      });

      for (const participant of participants) {
        await prisma.participant.delete({
          where: {
            id: participant.id,
          },
        });
      }

      for (const notification of notifications) {
        await prisma.notification.delete({
          where: {
            id: notification.id,
          },
        });
      }
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test(
    "Return 401 authentication error when trying to join a community" +
      " while being unauthenticated",
    done => {
      request(app)
        .post(`/community/${communityNone?.id}/join`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to send a join request to the community",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  test("Return 422 HTTP error when communityid param is invalid", done => {
    agent
      .post("/community/testcommunity1/join")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to send a join request to the community");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "communityid",
          ).msg,
        ).toBe("Community id is invalid");
      })
      .expect(422, done);
  });

  test(
    "Return 400 HTTP error when trying to join community that doesn't" +
      " exist",
    done => {
      agent
        .post(`/community/${communityNone?.inbox.id}/join`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to send a join request to the community",
          error: {
            message: "Community with that id doesn't exist",
          },
        })
        .expect(404, done);
    },
  );

  test(
    "Return 409 HTTP error when trying to join a community when the user" +
      " is a PENDING participant in the community",
    done => {
      agent
        .post(`/community/${communityPending?.id}/join`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to send a join request to the community",
          error: {
            message: "You already sent a request to join the community",
          },
        })
        .expect(409, done);
    },
  );

  test(
    "Return 409 HTTP error when trying to join a community when the user" +
      " is already an ACTIVE participant in the community",
    done => {
      agent
        .post(`/community/${communityActive?.id}/join`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to send a join request to the community",
          error: {
            message: "You already joined the community",
          },
        })
        .expect(409, done);
    },
  );

  test("Return 200 success if everything is valid", done => {
    agent
      .post(`/community/${communityNone?.id}/join`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const participant = res.body.participant;

        expect(message).toBe(
          "Successfully sent a join request to the community",
        );
        expect(participant).toBeDefined();
        expect(participant?.status).toBe("PENDING");
      })
      .expect(200, done);
  });
});

describe(
  "Test community_request_POST with seedcommunity" +
    " while logged in as seeduser2",
  () => {
    let seedCommunity1: null | Community = null;
    let testParticipant1: null | Participant = null;
    let testNotification1: null | Notification = null;
    let testParticipant2: null | Participant = null;
    let testNotification2: null | Notification = null;
    let testNotificationError: null | Notification = null;
    let testNotificationCompleted: null | Notification = null;
    let testParticipantCompleted: null | Participant = null;
    let testNotificationNotRequest: null | Notification = null;

    beforeAll(async () => {
      const seedUser1 = await prisma.user.findUnique({
        where: {
          username: "seeduser1",
        },
      });
      const seedUser2 = await prisma.user.findUnique({
        where: {
          username: "seeduser2",
        },
      });
      const seedUser3 = await prisma.user.findUnique({
        where: {
          username: "seeduser3",
        },
      });
      const seedUser4 = await prisma.user.findUnique({
        where: { username: "seeduser4" },
      });
      const seedUser5 = await prisma.user.findUnique({
        where: {
          username: "seeduser5",
        },
      });

      seedCommunity1 = await prisma.community.findUnique({
        where: {
          name: "seedcommunity1",
        },
      });

      // Create community join request with seeduser2 to seedcommuntiy1
      if (seedCommunity1 && seedUser2 && seedUser1) {
        testParticipant1 = await prisma.participant.create({
          data: {
            role: "MEMBER",
            communityId: seedCommunity1.id,
            userId: seedUser2.id,
            status: "PENDING",
          },
        });

        testNotification1 = await prisma.notification.create({
          data: {
            payload: "requested to join",
            type: "COMMUNITYREQUEST",
            communityId: seedCommunity1.id,
            triggeredById: seedUser2.id,
            triggeredForId: seedUser1.id,
            status: "PENDING",
            isRead: false,
          },
        });

        testNotificationNotRequest = await prisma.notification.create({
          data: {
            payload: "accepted your join request",
            type: "REQUESTUPDATE",
            communityId: seedCommunity1.id,
            triggeredById: seedUser1.id,
            triggeredForId: seedUser2.id,
            status: "COMPLETED",
            isRead: false,
          },
        });
      }

      if (seedCommunity1 && seedUser3 && seedUser1) {
        testParticipant2 = await prisma.participant.create({
          data: {
            role: "MEMBER",
            communityId: seedCommunity1.id,
            userId: seedUser3.id,
            status: "PENDING",
          },
        });

        testNotification2 = await prisma.notification.create({
          data: {
            payload: "requested to join",
            type: "COMMUNITYREQUEST",
            communityId: seedCommunity1.id,
            triggeredById: seedUser3.id,
            triggeredForId: seedUser1.id,
            status: "PENDING",
            isRead: false,
          },
        });
      }

      if (seedCommunity1 && seedUser1 && seedUser4) {
        testParticipantCompleted = await prisma.participant.create({
          data: {
            role: "MEMBER",
            communityId: seedCommunity1.id,
            userId: seedUser4.id,
            status: "ACTIVE",
          },
        });

        // Create a notification that is completed
        testNotificationCompleted = await prisma.notification.create({
          data: {
            payload: "requested to join",
            type: "COMMUNITYREQUEST",
            triggeredById: seedUser4.id,
            triggeredForId: seedUser1.id,
            status: "COMPLETED",
            isRead: true,
          },
        });
      }

      if (seedCommunity1 && seedUser1 && seedUser5) {
        /* Create a notification for a community request without
             a corresponfing participant */
        testNotificationError = await prisma.notification.create({
          data: {
            payload: "requested to join",
            type: "COMMUNITYREQUEST",
            triggeredById: seedUser5.id,
            triggeredForId: seedUser1.id,
            status: "PENDING",
            isRead: false,
          },
        });
      }
    });

    afterAll(async () => {
      try {
        if (testParticipant1) {
          await prisma.participant.delete({
            where: {
              id: testParticipant1.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testParticipant2) {
          await prisma.participant.delete({
            where: {
              id: testParticipant2.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testParticipantCompleted) {
          await prisma.participant.delete({
            where: {
              id: testParticipantCompleted.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testNotification1) {
          await prisma.notification.delete({
            where: {
              id: testNotification1.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testNotification2) {
          await prisma.notification.delete({
            where: {
              id: testNotification2.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testNotificationNotRequest) {
          await prisma.notification.delete({
            where: {
              id: testNotificationNotRequest.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      try {
        if (testNotificationCompleted) {
          await prisma.notification.delete({
            where: {
              id: testNotificationCompleted.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
      try {
        if (testNotificationError) {
          await prisma.notification.delete({
            where: {
              id: testNotificationError.id,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    test(
      "Return 401 authentication error when trying to update community" +
        " request while being unauthenticated",
      done => {
        request(app)
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message: "You are not authenticated",
            },
          })
          .expect(401, done);
      },
    );

    const agent = request.agent(app);

    login(agent, {
      username: "seeduser2",
      password: "seed@User2",
    });

    test("Return 422 HTTP error when communityid param is invalid", done => {
      agent
        .post("/community/testcommunity1/request")
        .send({
          action: "REJECT",
          notificationid: testNotification1?.id,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe(
            "Failed to trigger the action on the community request",
          );
          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "communityid",
            ).msg,
          ).toBe("Community id is invalid");
        })
        .expect(422, done);
    });

    test("Return 422 HTTP error when notificationid param is invalid", done => {
      agent
        .post(`/community/${seedCommunity1?.id}/request`)
        .send({
          action: "REJECT",
          notificationid: "testnotificationid1",
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe(
            "Failed to trigger the action on the community request",
          );
          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "notificationid",
            ).msg,
          ).toBe("Community notification id is invalid");
        })
        .expect(422, done);
    });

    test("Return 422 HTTP error when action param is invalid", done => {
      agent
        .post(`/community/${seedCommunity1?.id}/request`)
        .send({
          action: "reject",
          notificationid: testNotification1?.id,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe(
            "Failed to trigger the action on the community request",
          );
          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "action",
            ).msg,
          ).toBe(
            "Community request's action must either be REJECT or ACCEPT" +
              " and must always be capitalised",
          );
        })
        .expect(422, done);
    });

    test(
      "Return 404 error when trying to update community request on a" +
        " community that doesn't exist",
      done => {
        agent
          .post(`/community/${testParticipant1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testNotification1?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message: "Community with that id doesn't exist",
            },
          })
          .expect(404, done);
      },
    );

    test(
      "Return 404 error when trying to update community request with " +
        " notification id that doesn't exist",
      done => {
        agent
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testParticipant1?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message: "Notification with that id doesn't exist",
            },
          })
          .expect(404, done);
      },
    );

    test(
      "Return 400 error when trying to update community request with " +
        " notification that has no corresponding participant",
      done => {
        agent
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testNotificationError?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message:
                "Cannot find the corresponding notification's participant" +
                " data",
            },
          })
          .expect(400, done);
      },
    );

    test(
      "Return 409 error when trying to perform action on a notification " +
        " that isn't a community request",
      done => {
        agent
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testNotificationNotRequest?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message: "Can only perform action on a community request",
            },
          })
          .expect(409, done);
      },
    );

    test(
      "Return 409 error when trying to perform action on a completed" +
        " notification request",
      done => {
        agent
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testNotificationCompleted?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to trigger the action on the community request",
            error: {
              message:
                "Can only perform action on a community request" +
                " with PENDING status",
            },
          })
          .expect(409, done);
      },
    );

    test(
      "Return 403 error when trying to update community request" +
        " when the user is not the owner of the community",
      done => {
        agent
          .post(`/community/${seedCommunity1?.id}/request`)
          .send({
            action: "REJECT",
            notificationid: testNotification1?.id,
          })
          .expect("Content-Type", /json/)
          .expect({
            message:
              "You are not authorised to perform any actions on this community",
            error: {
              message: "You are not the owner of this community",
            },
          })
          .expect(403, done);
      },
    );
    const agent2 = request.agent(app);

    login(agent2, { username: "seeduser1", password: "seed@User1" });

    test("Successfully reject community request", done => {
      agent2
        .post(`/community/${seedCommunity1?.id}/request`)
        .send({
          action: "REJECT",
          notificationid: testNotification1?.id,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const notification = res.body.notification;
          const participant = res.body.participant;
          expect(message).toBe("Successfully rejected the community request");
          expect(notification.status).toBe("REJECTED");
          expect(notification.isRead).toBeTruthy();
          expect(participant).toBeNull();
        })
        .expect(200, done);
    });

    test("Successfully accept community request", done => {
      agent2
        .post(`/community/${seedCommunity1?.id}/request`)
        .send({
          action: "ACCEPT",
          notificationid: testNotification2?.id,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const notification = res.body.notification;
          const participant = res.body.participant;
          const newNotifications = res.body.newNotifications as Notification[];

          expect(message).toBe("Successfully accepted the community request");
          expect(notification.status).toBe("ACCEPTED");
          expect(notification.isRead).toBeTruthy();
          expect(participant.status).toBe("ACTIVE");
          expect(newNotifications).toBeDefined();

          newNotifications.forEach(newNotification => {
            expect(newNotification.type).toBe("REQUESTUPDATE");
            expect(newNotification.status).toBe("COMPLETED");
          });
        })
        .expect(200, done);
    });
  },
);
