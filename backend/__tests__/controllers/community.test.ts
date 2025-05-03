import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import {
  deleteCommunityById,
  getCommunityByName,
} from "../../database/prisma/communityQueries";
import { CommunityPOST } from "../../@types/apiResponse";

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
  beforeAll(() => {
    const communities = ["community_name_test", "community_name_test_1"];

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
        expect(error.validationError[0].msg).toBe(
          "Community bio must not exceed 255 characters",
        );
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
        expect(error.validationError[0].msg).toEqual(
          "Avatar must only be in jpeg or png format",
        );
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
        expect(error.validationError[0].msg).toEqual(
          "Banner must only be in jpeg or png format",
        );
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

describe("Test Communities_get controller", () => {
  const agent = request.agent(app);

  login(agent, {
    username: "client_user_1",
    password: "Client_password_1",
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
});
