import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import { User } from "@prisma/client";
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
