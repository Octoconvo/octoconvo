import * as userController from "../../controllers/user";
import request from "supertest";
import { deleteUserByUsername } from "../../database/prisma/userQueries";
import TestAgent from "supertest/lib/agent";
import { Request, Response, NextFunction } from "express";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";

describe("Test user signup using local strategy", () => {
  afterAll(async () => {
    await deleteUserByUsername("testuser1");
  });

  test("Successfully create an account if all fields passed the validation", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "testuser1",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const user = res.body.user;
        const message = res.body.message;

        expect(message).toEqual("Successfully signed up as testuser1");
        expect(user.id).toBeTruthy();
      })
      .expect(200, done);
  });

  test("Failed to create an account username is already taken", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "testuser1",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0]).toStrictEqual({
          field: "username",
          value: "testuser1",
          msg: "Username is already taken",
        });
      })
      .expect(422, done);
  });

  test("Failed to create an account if username contains more than 32 characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "Thisisareallylongstringcharactertotestlongstringusername",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Username must not exceed 32 characters",
        );
      })
      .expect(422, done);
  });

  test("Failed to create an account if username contains forbidden characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "testuser.1",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Username must only contain alphanumeric characters and underscores",
        );
      })
      .expect(422, done);
  });

  test("Failed to create an account if password less than 8 characters", done => {
    request(app)
      .post("/account/signup")
      .type("form")
      .send({
        username: "testuser2",
        password: "123",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;
        expect(message).toEqual("Failed to create a new account");
        expect(error.validationError[0].msg).toEqual(
          "Password must contain at least 8 characters",
        );
      })
      .expect(422, done);
  });

  test(
    "Failed to create an account if password doesn't contain at least one digit, one lowercase letter," +
      "one uppercase letter, and one special character",
    done => {
      request(app)
        .post("/account/signup")
        .type("form")
        .send({
          username: "testuser2",
          password: "Test@user",
        })
        .expect("Content-Type", /json/)
        .expect(res => {
          const message = res.body.message;
          const error = res.body.error;
          expect(message).toEqual("Failed to create a new account");
          expect(error.validationError[0].msg).toEqual(
            "Password must contain at least one digit, one lowercase letter, one uppercase letter," +
              "and one special character",
          );
        })
        .expect(422, done);
    },
  );
});

describe("Test user login get", () => {
  test(
    "Return json object with user equal to false if user is not" +
      "authenticated",
    done => {
      request(app)
        .get("/account/login")
        .expect("Content-Type", /json/)
        .expect(res => {
          const message = res.body.message;

          expect(message).toEqual("You are not authenticated");
        })
        .expect(200, done);
    },
  );

  const agent: TestAgent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Return json object with user id if user is authenticated", done => {
    agent
      .get("/account/login")
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const user = res.body.user;

        expect(message).toEqual("You are authenticated");
        expect(user.id).toBeDefined();
      })
      .expect(200)
      .end(done);
  });
});

describe("Test user login using local strategy", () => {
  test("Failed to login if input validation failed", done => {
    request(app)
      .post("/account/login")
      .type("form")
      .send({
        username: "testuser1.",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error.validationError;

        expect(message).toEqual("Failed to log in");
        expect(error[0].msg).toEqual(
          "Username must only contain alphanumeric characters and underscores",
        );
      })
      .expect(422, done);
  });
  test("Failed to login if username is invalid", done => {
    request(app)
      .post("/account/login")
      .type("form")
      .send({
        username: "This_user_doesn_t_exist",
        password: "test@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toEqual("Failed to log in");
        expect(error.message).toEqual("Incorrect username or password");
      })
      .expect(401, done);
  });

  test("Failed to login if password is invalid", done => {
    request(app)
      .post("/account/login")
      .type("form")
      .send({
        username: "seeduser1",
        password: "seed@User2",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toEqual("Failed to log in");
        expect(error.message).toEqual("Incorrect username or password");
      })
      .expect(401, done);
  });

  test("Successfully login if all fields are valid", done => {
    request(app)
      .post("/account/login")
      .type("form")
      .send({
        username: "seeduser1",
        password: "seed@User1",
      })
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;
        const user = res.body.user;

        expect(message).toEqual("Successfully logged in");
        expect(user.id).toBeDefined();
      })
      .expect(200, done);
  });
});

describe("Test logout get controller", () => {
  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test("Successfully logged out if user is authenticated", done => {
    agent
      .post("/account/logout")
      .expect("Content-Type", /json/)
      .expect({
        message: "Successfully logged out",
      })
      .expect(200)
      .end(done);
  });

  test("User object is undefined after logging out", done => {
    request(app)
      .get("/account/login")
      .expect("Content-Type", /json/)
      .expect(res => {
        const message = res.body.message;

        expect(message).toEqual("You are not authenticated");
      })
      .expect(200, done);
  });

  test("Call next if an error occured when trying to log out", () => {
    const error = new Error("Network Error");
    const req: Request = {
      logout: jest.fn(callback => {
        callback(error);
      }),
    } as unknown as Request;
    const res: Response = { json: jest.fn(() => {}) } as unknown as Response;
    const next: NextFunction = jest.fn(() => {});

    userController.user_log_out_post(req, res, next);
    expect(req.logout).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});

export default app;
