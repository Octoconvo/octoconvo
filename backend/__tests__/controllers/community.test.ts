import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import {
  deleteCommunityById,
  getCommunityByName,
} from "../../database/prisma/communityQueries";
import { CommunityPOST } from "../../@types/apiResponse";
import { Community, Inbox } from "@prisma/client";
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
    username: "client_user_1",
    password: "Client_password_1",
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
    username: "client_user_1",
    password: "Client_password_1",
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

  let community102: CommunityExplore | null = null;
  let community10: CommunityExplore | null = null;

  beforeAll(async () => {
    try {
      community102 = await prisma.community.findUnique({
        where: {
          name: "seedcommunity102",
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
    username: "client_user_1",
    password: "Client_password_1",
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
    const ISOString = community102?.createdAt
      ? new Date(community102?.createdAt).toISOString()
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
    const ISOString = community102?.createdAt
      ? new Date(community102?.createdAt).toISOString()
      : "";
    const cursor =
      `${community102?._count.participants}` +
      "_" +
      `${community102?.id}` +
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
          if (community102) {
            expect(Number(community._count.participants)).toBeLessThanOrEqual(
              Number(community102?._count.participants),
            );

            if (
              Number(community._count.participants) ===
              Number(community102?._count.participants)
            ) {
              expect(
                new Date(community.createdAt) <
                  new Date(community102?.createdAt),
              ).toBeTruthy();
            }
          }
        });
      })
      .expect(200, done);
  });

  test("Return the correct nextCursor", done => {
    const ISOString = community102?.createdAt
      ? new Date(community102?.createdAt).toISOString()
      : "";
    const cursor =
      `${community102?._count.participants}` +
      "_" +
      `${community102?.id}` +
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
