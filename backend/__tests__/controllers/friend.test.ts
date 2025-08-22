import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { getValidationErrorMsg, login } from "../../utils/testUtils";

describe("Test user's friendship status get controller with seeduser1", () => {
  test(
    "Return 401 unauthorized if user tries to get friendship status" +
      " without being unauthenticated",
    done => {
      request(app)
        .get("/friend/friendship-status")
        .expect("Content-type", /json/)
        .expect({
          message: "Failed to fetch your friendship status with the user",
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

  test(
    "Failed to fetch user's friendship status when the username query param " +
      " is empty",
    done => {
      agent
        .get("/friend/friendship-status")
        .expect("Content-type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;
          const usernameQueryValidationErrorMsg = getValidationErrorMsg({
            error,
            field: "username",
          });

          expect(message).toBe(
            "Failed to fetch your friendship status with the user",
          );
          expect(usernameQueryValidationErrorMsg).toBe(
            "Username query is required",
          );
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to fetch user's friendship status if the username query param" +
      " is longer than 32 characters",
    done => {
      const usernameQuery = "a".repeat(33);
      agent
        .get(`/friend/friendship-status?username=${usernameQuery}`)
        .expect("Content-type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;
          const usernameQueryValidationErrorMsg = getValidationErrorMsg({
            error,
            field: "username",
          });

          expect(message).toBe(
            "Failed to fetch your friendship status with the user",
          );
          expect(usernameQueryValidationErrorMsg).toBe(
            "Username query must not exceed 32 characters",
          );
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to fetch user's friendship status if the username query param" +
      " contains characters other than alphanumerics and underscores",
    done => {
      const usernameQuery = "@testusername1";
      agent
        .get(`/friend/friendship-status?username=${usernameQuery}`)
        .expect("Content-type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;
          const usernameQueryValidationErrorMsg = getValidationErrorMsg({
            error,
            field: "username",
          });

          expect(message).toBe(
            "Failed to fetch your friendship status with the user",
          );
          expect(usernameQueryValidationErrorMsg).toBe(
            "Username query must only contain alphanumeric characters" +
              " and underscores",
          );
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to fetch user's friendship status when the user with the" +
      " username doesn't exist",
    done => {
      const usernameQuery = "testusername1";
      agent
        .get(`/friend/friendship-status?username=${usernameQuery}`)
        .expect("Content-type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const errorMessage = res.body.error.message;

          expect(message).toBe(
            "Failed to fetch your friendship status with the user",
          );
          expect(errorMessage).toBe("User with that username doesn't exist");
        })
        .expect(404, done);
    },
  );

  test(
    "Successfully return friendship status if all validation passed and user" +
      " is not null",
    done => {
      const usernameQuery = "seeduser2";
      agent
        .get(`/friend/friendship-status?username=${usernameQuery}`)
        .expect("Content-type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;

          expect(message).toBe(
            "Successfully fetched your friendship status with seeduser2",
          );
        })
        .expect(200, done);
    },
  );

  test("Return NONE friendship status", done => {
    const usernameQuery = "seeduser4";
    agent
      .get(`/friend/friendship-status?username=${usernameQuery}`)
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const frienshipStatus = res.body.friendshipStatus;

        expect(frienshipStatus).toBe("NONE");
      })
      .expect(200, done);
  });

  test("Return ACTIVE friendship status", done => {
    const usernameQuery = "seeduser2";
    agent
      .get(`/friend/friendship-status?username=${usernameQuery}`)
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const frienshipStatus = res.body.friendshipStatus;

        expect(frienshipStatus).toBe("ACTIVE");
      })
      .expect(200, done);
  });

  test("Return PENDING friendship status", done => {
    const usernameQuery = "seeduser3";
    agent
      .get(`/friend/friendship-status?username=${usernameQuery}`)
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const frienshipStatus = res.body.friendshipStatus;

        expect(frienshipStatus).toBe("PENDING");
      })
      .expect(200, done);
  });
});

describe("Test user's friendship status get controller with seeduser2", () => {
  const agent = request.agent(app);
  login(agent, {
    username: "seeduser2",
    password: "seed@User2",
  });

  test("Return ACTIVE friendship status", done => {
    const usernameQuery = "seeduser1";
    agent
      .get(`/friend/friendship-status?username=${usernameQuery}`)
      .expect("Content-type", /json/)
      .expect((res: Response) => {
        const frienshipStatus = res.body.friendshipStatus;

        expect(frienshipStatus).toBe("ACTIVE");
      })
      .expect(200, done);
  });
});
