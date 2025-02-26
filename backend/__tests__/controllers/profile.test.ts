import request from "supertest";
import app from "../../config/testConfig";

describe("Test user profile get controller", () => {
  test("Return user profile date if user exists", done => {
    request(app)
      .get("/profile/513c920c-3921-48b2-88d7-5b8156b9e6b8")
      .expect("Content-type", /json/)
      .expect({
        message: "Succesfully retrieved user profile",
        userProfile: {
          id: "513c920c-3921-48b2-88d7-5b8156b9e6b8",
          username: "client_user_1",
          displayName: "client_user_1",
          avatar: null,
          banner: null,
          bio: null,
          lastSeen: "2025-02-13T18:33:35.610Z",
          createdAt: "2025-02-13T18:33:35.610Z",
          updatedAt: "2025-02-13T18:33:35.610Z",
        },
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
