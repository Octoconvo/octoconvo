import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";

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
    return { publicUrl: `test/${bucketName}/${path}` };
  },
}));

describe("Test user profile get controller", () => {
  test("Return user profile date if user exists", done => {
    request(app)
      .get("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;

        expect(message).toBe("Successfully retrieved user profile");
        expect(userProfile).toBeDefined();
        expect(userProfile.id).toBe("513c920c-3921-48b2-88d7-5b8156b9e6b8");
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
  test("Return 401 unauthorized if user tries to update profile without being unauthenticated", done => {
    request(app)
      .post("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
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
    username: "client_user_1",
    password: "Client_password_1",
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
      .post("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
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
      .post("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
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

  test("Successfully update avatar if image mimetype is valid", done => {
    agent
      .post("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
      .attach("avatar", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;
        const avatar = userProfile?.avatar;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(avatar).toBeDefined();
        const avatarArr = avatar.split("/");
        expect(avatarArr[avatarArr.length - 1]).toContain("image-");
        expect(avatarArr[avatarArr.length - 1]).toContain(".jpg");
      })
      .expect(200)
      .end(done);
  });

  test("Successfully update banner if image mimetype is valid", done => {
    agent
      .post("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
      .attach("banner", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const userProfile = res.body.userProfile;
        const banner = userProfile?.banner;

        expect(message).toEqual("Successfully updated user profile");
        expect(userProfile).toBeDefined();
        expect(banner).toBeDefined();
        const bannerArr = banner.split("/");
        expect(bannerArr[bannerArr.length - 1]).toContain("image-");
        expect(bannerArr[bannerArr.length - 1]).toContain(".jpg");
      })
      .expect(200)
      .end(done);
  });
});
