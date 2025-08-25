import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { getValidationErrorMsg, login } from "../../utils/testUtils";
import prisma from "../../database/prisma/client";
import { User } from "@prisma/client";

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

describe("Test friend add post controller", () => {
  let seedUser1: null | User = null;
  let friendNONE: null | User = null;

  beforeAll(async () => {
    try {
      seedUser1 = await prisma.user.findUnique({
        where: {
          username: "seeduser1",
        },
      });

      friendNONE = await prisma.user.findFirst({
        where: {
          friendsOf: {
            every: {
              NOT: {
                friendOf: {
                  username: "seeduser1",
                },
              },
            },
          },
        },
      });

      console.log({ friendNONE });
    } catch (err) {
      console.error(err);
    }
  });

  afterEach(async () => {
    if (friendNONE) {
      try {
        const friends = await prisma.friend.findMany({
          where: {
            OR: [
              {
                AND: [
                  {
                    friendOf: {
                      username: "seeduser1",
                    },
                  },
                  {
                    friend: {
                      username: friendNONE.username,
                    },
                  },
                ],
              },
              {
                AND: [
                  {
                    friendOf: {
                      username: friendNONE.username,
                    },
                  },
                  {
                    friend: {
                      username: "seeduser1",
                    },
                  },
                ],
              },
            ],
          },
        });

        const notifications = await prisma.notification.findMany({
          where: {
            type: "FRIENDREQUEST",
            triggeredBy: {
              username: "seeduser1",
            },
            triggeredFor: {
              username: friendNONE.username,
            },
          },
        });

        for (const friend of friends) {
          await prisma.friend.delete({
            where: {
              friendOfId_friendId: {
                friendOfId: friend.friendOfId,
                friendId: friend.friendId,
              },
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
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test(
    "Return 401 authentication error when trying to add a friend" +
      " while being unauthenticated",
    done => {
      request(app)
        .post(`/friend?username=${friendNONE?.username}`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to send a friend request to the user",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  test(
    "Return 404 error when trying to add a user that doesn't" + " exist",
    done => {
      const usernameQuery = "testusername1DONOTEXIST";
      agent
        .post(`/friend?username=${usernameQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const errorMessage = res.body.error.message;

          expect(message).toBe("Failed to send a friend request to the user");
          expect(errorMessage).toBe("User with that username doesn't exist");
        })
        .expect(404, done);
    },
  );

  test(
    "Return 409 error when the trying to send a friend request to" +
      " a friend",
    done => {
      const usernameQuery = "seeduser2";
      agent
        .post(`/friend?username=${usernameQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const errorMessage = res.body.error.message;

          expect(message).toBe("Failed to send a friend request to the user");
          expect(errorMessage).toBe("You are already friends with the user");
        })
        .expect(409, done);
    },
  );

  test(
    "Return 409 error when the trying to send a friend request to" +
      " the user with a pending friend request",
    done => {
      const usernameQuery = "seeduser3";
      agent
        .post(`/friend?username=${usernameQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const errorMessage = res.body.error.message;

          expect(message).toBe("Failed to send a friend request to the user");
          expect(errorMessage).toBe(
            "You already sent a friend request to the user",
          );
        })
        .expect(409, done);
    },
  );

  test("Return 200 success if all validations pass", done => {
    const usernameQuery = friendNONE?.username;
    agent
      .post(`/friend?username=${usernameQuery}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;

        expect(message).toBe("Successfully sent a friend request to the user");
      })
      .expect(200, done);
  });

  test("Succss 200 return 2 friends object", done => {
    const usernameQuery = friendNONE?.username;
    agent
      .post(`/friend?username=${usernameQuery}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;

        expect(friends.length).toBe(2);
      })
      .expect(200, done);
  });

  test("Succss 200 create the correct friends", done => {
    const usernameQuery = friendNONE?.username;
    agent
      .post(`/friend?username=${usernameQuery}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;

        expect(friends[0].friendOfId).toBe(seedUser1?.id);
        expect(friends[0].friendId).toBe(friendNONE?.id);
        expect(friends[1].friendOfId).toBe(friendNONE?.id);
        expect(friends[1].friendId).toBe(seedUser1?.id);
      })
      .expect(200, done);
  });
});
