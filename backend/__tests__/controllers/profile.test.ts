import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { getValidationErrorMsg, login } from "../../utils/testUtils";
import { User } from "@prisma/client";
import prisma from "../../database/prisma/client";
import { ProfileRes } from "../../@types/apiResponse";

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

describe("Test user profile get controller", () => {
  let seedUser1: null | User = null;

  beforeAll(async () => {
    seedUser1 = await prisma.user.findUnique({
      where: {
        username: "seeduser1",
      },
    });
  });

  test("Return user profile date if user exists", done => {
    request(app)
      .get(`/profile/${seedUser1?.id}`)
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;

        expect(message).toBe("Successfully retrieved user profile");
        expect(userProfile).toBeDefined();
        expect(userProfile.id).toBe(seedUser1?.id);
      })
      .expect(200, done);
  });

  test("Return 404 response if user doesn't exist", done => {
    request(app)
      .get("/profile/1")
      .expect("Content-type", /json/)
      .expect({
        message: "Failed to retrieve user profile",
        error: {
          message: "User profile doesn't exist",
        },
      })
      .expect(404, done);
  });
});

describe("Test user profile post controller", () => {
  let seedUser1: null | User = null;

  beforeAll(async () => {
    seedUser1 = await prisma.user.findUnique({
      where: {
        username: "seeduser1",
      },
    });
  });

  test("Return 401 unauthorized if user tries to update profile without being unauthenticated", done => {
    request(app)
      .post(`/profile/${seedUser1?.id}`)
      .type("form")
      .send({
        username: "test_user_up",
        displayName: "test_user_up",
        bio: "This is the new bio.",
      })
      .expect("Content-type", /json/)
      .expect({
        message: "Failed to update user profile",
        error: {
          message: "You are not authenticated",
        },
      })
      .expect(401, done);
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Return 404 response if user doesn't exist", done => {
    agent
      .post("/profile/1")
      .expect("Content-type", /json/)
      .expect({
        message: "Failed to update user profile",
        error: {
          message: "User profile doesn't exist",
        },
      })
      .expect(404)
      .end(done);
  });

  test("Failed to update avatar if image mimetype is invalid", done => {
    agent
      .post(`/profile/${seedUser1?.id}`)
      .attach("avatar", __dirname + "/../assets/test-img-invalid-01.svg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toEqual("Failed to update user profile");
        expect(error).toBeDefined();
        expect(error.validationError[0].msg).toEqual(
          "Avatar must only be in jpeg or png format",
        );
      })
      .expect(422)
      .end(done);
  });

  test("Successfully update data when user is authorized to edit profile", done => {
    agent
      .post(`/profile/${seedUser1?.id}`)
      .send({
        displayname: "test_user_up",
        bio: "This is the new bio.",
      })
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(userProfile.displayName).toEqual("test_user_up");
        expect(userProfile.bio).toEqual("This is the new bio.");
      })
      .expect(200)
      .end(done);
  });

  test("Successfully update displayname if user is authorized to edit profile", done => {
    agent
      .post(`/profile/${seedUser1?.id}`)
      .send({
        displayname: "test_user_1",
      })
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(userProfile.displayName).toEqual("test_user_1");
      })
      .expect(200)
      .end(done);
  });

  test("Successfully update avatar if image mimetype is valid", done => {
    agent
      .post(`/profile/${seedUser1?.id}`)
      .attach("avatar", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;
        const avatar = userProfile?.avatar;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(avatar).toBeDefined();
        expect(avatar).toBe(
          "https://mqzsctdttuxrgvlpthvy.supabase.co/storage/v1/object/public/" +
            "avatar/513c920c-3921-48b2-88d7-5b8156b9e6b8/" +
            "image-7ee20129-ce65-43ce-b324-6c8cb514c1cd.png",
        );
      })
      .expect(200)
      .end(done);
  });

  test("Successfully update banner if image mimetype is valid", done => {
    agent
      .post(`/profile/${seedUser1?.id}`)
      .attach("banner", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;
        const banner = userProfile?.banner;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(banner).toBeDefined();
        expect(banner).toBe(
          "https://mqzsctdttuxrgvlpthvy.supabase.co/storage/v1/object/public/" +
            "banner/513c920c-3921-48b2-88d7-5b8156b9e6b8/" +
            "image-887cc252-e94c-455f-bc99-4d5c7a0d8b47.png",
        );
      })
      .expect(200)
      .end(done);
  });
});

describe("Test profile_explore_get", () => {
  let seedProfiles: ProfileRes[] = [];
  let lastProfile: null | ProfileRes = null;
  let middleProfile: null | ProfileRes = null;

  beforeAll(async () => {
    try {
      seedProfiles = await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                startsWith: "seeduser",
              },
            },
            {
              displayName: {
                startsWith: "seedUser",
              },
            },
          ],
        },
        omit: {
          password: true,
        },
        orderBy: [{ displayName: "asc" }, { username: "asc" }],
      });

      lastProfile = seedProfiles[seedProfiles.length - 1];

      const middleIndex =
        seedProfiles.length % 2 === 0
          ? seedProfiles.length / 2 - 1
          : (seedProfiles.length + 1) / 2 - 1;

      if (middleIndex >= 0) {
        middleProfile = seedProfiles[middleIndex];
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
      }
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Failed to fetch profiles if the user is unauthenticated", done => {
    request(app)
      .get("/explore/profiles")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch profiles",
        error: {
          message: "You are not authenticated",
        },
      })
      .expect(401, done);
  });

  test(
    "Failed to fetch profiles if the name query is longer" + " than 128",
    done => {
      const nameQuery = "a".repeat(129);

      agent
        .get(`/explore/profiles?name=${nameQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to fetch profiles");
          expect(
            getValidationErrorMsg({
              error,
              field: "name",
            }),
          ).toBe("Name query must not exceed 128 characters");
        })
        .expect(422, done);
    },
  );

  test("Failed to fetch profiles if the limit is not an integer", done => {
    agent
      .get("/explore/profiles?limit=0.1")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch profiles");
        expect(
          getValidationErrorMsg({
            error,
            field: "limit",
          }),
        ).toBe("Limit must be an integer and between 1 and 100");
      })
      .expect(422, done);
  });

  test("Failed to fetch profiles if the limit is bigger than 100", done => {
    agent
      .get("/explore/profiles?limit=101")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch profiles");
        expect(
          getValidationErrorMsg({
            error,
            field: "limit",
          }),
        ).toBe("Limit must be an integer and between 1 and 100");
      })
      .expect(422, done);
  });

  test("Failed to fetch profiles if the limit is smaller than 1", done => {
    agent
      .get("/explore/profiles?limit=0")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch profiles");
        expect(
          getValidationErrorMsg({
            error,
            field: "limit",
          }),
        ).toBe("Limit must be an integer and between 1 and 100");
      })
      .expect(422, done);
  });

  test("Failed to fetch profiles if the cursor id is invalid", done => {
    agent
      .get("/explore/profiles?cursor=8")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch profiles");
        expect(
          getValidationErrorMsg({
            error,
            field: "cursor",
          }),
        ).toBe("Cursor value is invalid");
      })
      .expect(422, done);
  });

  test(
    "Return 30 profiles on a successfull request with no" + " query params",
    done => {
      agent
        .get("/explore/profiles")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const profiles = res.body.profiles;

          expect(message).toBe("Successfully fetched profiles");
          expect(profiles.length).toBe(30);
        })
        .expect(200, done);
    },
  );

  test(
    "Return the correct cursor when there are more profiles to" + " fetch",
    done => {
      agent
        .get("/explore/profiles?name=seeduser")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const nextCursor = res.body.nextCursor;

          expect(message).toBe("Successfully fetched profiles");
          expect(nextCursor).toBe(seedProfiles[29].id);
        })
        .expect(200, done);
    },
  );

  test("Return false cursor when there are no more profiles to fetch", done => {
    const cursor =
      `${lastProfile?.username}` + "_" + `${lastProfile?.displayName}`;

    agent
      .get(`/explore/profiles?cursor=${cursor}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const nextCursor = res.body.nextCursor;

        expect(message).toBe("Successfully fetched profiles");
        expect(nextCursor).toBe(false);
      })
      .expect(200, done);
  });

  test("Return correct profiles with cursor", done => {
    const cursor =
      `${middleProfile?.username}` + "_" + `${middleProfile?.displayName}`;

    agent
      .get(`/explore/profiles?cursor=${cursor}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const profiles = res.body.profiles;

        expect(message).toBe("Successfully fetched profiles");
        expect(profiles.length).toBeGreaterThanOrEqual(1);

        for (const profile of profiles) {
          if (middleProfile?.username) {
            expect(profile.username > middleProfile?.username).toBeTruthy();
          }

          if (middleProfile?.displayName) {
            expect(
              profile.displayName >= middleProfile?.displayName,
            ).toBeTruthy();
          }
        }
      })
      .expect(200, done);
  });
});
