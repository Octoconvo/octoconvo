import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { getValidationErrorMsg, login } from "../../utils/testUtils";
import { Friend, User } from "@prisma/client";
import { NotificationRes } from "../../@types/apiResponse";
import { UserFriendData } from "../../@types/database";
import { constructFriendCursor } from "../../utils/cursor";
import {
  getUserFriends,
  getUserLastFriend,
  createNotification,
  createFriendsAndNotification,
  deleteNotificatioById,
  deleteFriendByIds,
  deleteFriendRequests,
} from "../../database/prisma/testQueries";
import { logErrorMessage } from "../../utils/loggerUtils";
import { getUserByUsername } from "../../database/prisma/userQueries";

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
    const usernameQuery = "seedloneuser1";
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
  const startDate = new Date().toISOString();
  const userUsername = "seeduser1";
  const userPassword = "seed@User1";
  const toBeFriendUsername = "seedloneuser1";
  let user: null | User = null;
  let toBeFriendUser: null | User = null;
  const friendsToDelete: Friend[] = [];

  beforeAll(async () => {
    try {
      user = await getUserByUsername(userUsername);
      toBeFriendUser = await getUserByUsername(toBeFriendUsername);
    } catch (
      //eslint-disable-next-line
      error
    ) {
      logErrorMessage("friend_add_post:Failed to setup");
    }
  });

  afterEach(async () => {
    const endDate = new Date().toISOString();

    for (const friend of friendsToDelete) {
      try {
        await deleteFriendByIds({
          friendId: friend.friendId,
          friendOfId: friend.friendOfId,
        });
      } catch (
        // eslint-disable-next-line
        err
      ) {
        logErrorMessage("friend_add_post:Failed to delete friend");
      }
    }

    if (user && toBeFriendUser) {
      try {
        await deleteFriendRequests({
          startDate,
          endDate,
          id: user.id,
          friendId: toBeFriendUser.id,
        });
      } catch (
        //eslint-disable-next-line
        err
      ) {
        logErrorMessage("friend_add_post:Failed to delete friend requests");
      }
    }
  });

  const agent = request.agent(app);
  login(agent, {
    username: userUsername,
    password: userPassword,
  });

  test(
    "Return 401 authentication error when trying to add a friend" +
      " while being unauthenticated",
    done => {
      request(app)
        .post("/friend")
        .send({
          username: toBeFriendUsername,
        })
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
      const username = "testusername1DONOTEXIST";
      agent
        .post("/friend")
        .send({ username })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const errorMessage = res.body.error.message;
          expect(errorMessage).toBe("User with that username doesn't exist");
        })
        .expect(404, done);
    },
  );

  test(
    "Return 409 error when the trying to send a friend request to" +
      " a friend",
    done => {
      const username = "seeduser2";
      agent
        .post("/friend")
        .send({
          username,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const errorMessage = res.body.error.message;
          expect(errorMessage).toBe("You are already friends with the user");
        })
        .expect(409, done);
    },
  );

  test(
    "Return 409 error when the trying to send a friend request to" +
      " the user with a pending friend request",
    done => {
      const username = "seeduser3";
      agent
        .post("/friend")
        .send({
          username,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const errorMessage = res.body.error.message;
          expect(errorMessage).toBe(
            "You already sent a friend request to the user",
          );
        })
        .expect(409, done);
    },
  );

  test(
    "Return 409 error when the user is trying to send a friend request to" +
      " themself",
    done => {
      const username = "seeduser1";
      agent
        .post("/friend")
        .send({
          username,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const errorMessage = res.body.error.message;
          expect(errorMessage).toBe(
            "You can't send a friend request to yourself",
          );
        })
        .expect(409, done);
    },
  );

  const pushFriendsToDelete = (res: Response) => {
    const friends: Friend[] = res.body.friends;
    for (const friend of friends) {
      friendsToDelete.push(friend);
    }
  };

  test("Return 200 success if all validations pass", done => {
    agent
      .post("/friend")
      .send({
        username: toBeFriendUsername,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        expect(message).toBe("Successfully sent a friend request to the user");
        pushFriendsToDelete(res);
      })
      .expect(200, done);
  });

  test("Succss 200 return 2 friends object", done => {
    agent
      .post("/friend")
      .send({
        username: toBeFriendUsername,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;
        expect(friends.length).toBe(2);
        pushFriendsToDelete(res);
      })
      .expect(200, done);
  });

  test("Succss 200 create the correct friends", done => {
    agent
      .post("/friend")
      .send({
        username: toBeFriendUsername,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;

        expect(friends[0].friendOfId).toBe(user?.id);
        expect(friends[0].friendId).toBe(toBeFriendUser?.id);
        expect(friends[1].friendOfId).toBe(toBeFriendUser?.id);
        expect(friends[1].friendId).toBe(user?.id);
        pushFriendsToDelete(res);
      })
      .expect(200, done);
  });
});

describe("Test friend request post controller", () => {
  const userUsername = "seedloneuser2";
  const userPassword = "seedlone@User2";

  const toBeFriendUsername1 = "seedloneuser3";
  const toBeFriendUsername2 = "seedloneuser4";

  let userFriendRequestNotification1: null | NotificationRes = null;
  let userFriendRequestNotification2: null | NotificationRes = null;

  let notUserFriendRequestNotification: null | NotificationRes = null;
  let userCommunityRequestNotification: null | NotificationRes = null;

  const notificationsToDelete: NotificationRes[] = [];
  const friendsToDelete: Friend[] = [];

  const pushFriendsToArray = (friends: Friend[], array: Friend[]) => {
    for (const friend of friends) {
      array.push(friend);
    }
  };

  beforeAll(async () => {
    try {
      const { notification: notification1, friends: friends1 } =
        await createFriendsAndNotification({
          username: userUsername,
          friendUsername: toBeFriendUsername1,
        });
      pushFriendsToArray(friends1, friendsToDelete);
      notificationsToDelete.push(notification1);

      const { notification: notification2, friends: friends2 } =
        await createFriendsAndNotification({
          username: userUsername,
          friendUsername: toBeFriendUsername2,
        });
      notificationsToDelete.push(notification2);

      pushFriendsToArray(friends2, friendsToDelete);
      userFriendRequestNotification1 = notification1;
      userFriendRequestNotification2 = notification2;

      notUserFriendRequestNotification = await createNotification({
        triggeredForUsername: toBeFriendUsername1,
        triggeredByUsername: userUsername,
        payload: "sent a friend request",
        type: "FRIENDREQUEST",
      });

      userCommunityRequestNotification = await createNotification({
        triggeredForUsername: userUsername,
        triggeredByUsername: toBeFriendUsername1,
        payload: "requested to join",
        type: "COMMUNITYREQUEST",
      });

      notificationsToDelete.push(
        notUserFriendRequestNotification,
        userCommunityRequestNotification,
      );
    } catch (err) {
      logErrorMessage(err);
    }
  });

  afterAll(async () => {
    for (const notification of notificationsToDelete) {
      try {
        await deleteNotificatioById(notification.id);
      } catch (err) {
        logErrorMessage(err);
      }
    }
    for (const friend of friendsToDelete) {
      try {
        await deleteFriendByIds({
          friendOfId: friend.friendOfId,
          friendId: friend.friendId,
        });
      } catch (err) {
        logErrorMessage(err);
      }
    }
  });

  const agent = request.agent(app);

  login(agent, {
    username: userUsername,
    password: userPassword,
  });

  test(
    "Return 401 authentication error when trying to perform an action on a" +
      " friend request while being unauthenticated",
    done => {
      request(app)
        .post("/friend/request")
        .send({
          action: "ACCEPT",
          notificationId: `${userFriendRequestNotification1?.id}`,
        })
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to perform the action on the friend request",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  test(
    "Failed to perform an action on the friend request if the notification" +
      " is invalid",
    done => {
      agent
        .post("/friend/request")
        .expect("Content-type", /json/)
        .send({
          notificationid: "testnotification1",
          action: "ACCEPT",
        })
        .expect((res: Response) => {
          const error = res.body.error;
          const notificationIdValidationErrorMsg = getValidationErrorMsg({
            error,
            field: "notificationid",
          });
          expect(notificationIdValidationErrorMsg).toBe(
            "Friend request notification id is invalid",
          );
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to perform an action on the friend request if the action" +
      " is neither 'REJECT' or 'ACCEPT'",
    done => {
      agent
        .post("/friend/request")
        .expect("Content-type", /json/)
        .send({
          notificationid: userFriendRequestNotification1?.id,
          action: "testaction1",
        })
        .expect((res: Response) => {
          const error = res.body.error;
          const actionValidationErrorMsg = getValidationErrorMsg({
            error,
            field: "action",
          });
          expect(actionValidationErrorMsg).toBe(
            "Action must either be REJECT or ACCEPT",
          );
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to perform an action on the friend request if the notification's" +
      " type is not FRIENDREQUEST",
    done => {
      agent
        .post("/friend/request")
        .expect("Content-type", /json/)
        .send({
          notificationid: userCommunityRequestNotification?.id,
          action: "ACCEPT",
        })
        .expect({
          message: "Failed to perform the action on the friend request",
          error: {
            message: "The friend request doesn't exist",
          },
        })
        .expect(404, done);
    },
  );

  test(
    "Failed to perform an action on the friend request if the user is not" +
      " authorised to perform the action on the friend request",
    done => {
      agent
        .post("/friend/request")
        .expect("Content-type", /json/)
        .send({
          notificationid: notUserFriendRequestNotification?.id,
          action: "ACCEPT",
        })
        .expect({
          message: "Failed to perform the action on the friend request",
          error: {
            message:
              "You are not authorised to perform any action on this" +
              " friend request",
          },
        })
        .expect(403, done);
    },
  );

  test("Succesfully rejected the friend request if everything passed", done => {
    agent
      .post("/friend/request")
      .expect("Content-type", /json/)
      .send({
        notificationid: userFriendRequestNotification1?.id,
        action: "REJECT",
      })
      .expect((res: Response) => {
        const message = res.body.message;
        const friends = res.body.friends;
        const notification = res.body.notification;
        const newNotification = res.body.newNotification;

        expect(message).toBe("Successfully rejected the friend request");
        expect(friends).toBeNull();
        expect(notification.status).toBe("REJECTED");
        expect(newNotification).toBeNull();
      })
      .expect(200, done);
  });

  test("Succesfully accepted the friend request if everything passed", done => {
    agent
      .post("/friend/request")
      .expect("Content-type", /json/)
      .send({
        notificationid: userFriendRequestNotification2?.id,
        action: "ACCEPT",
      })
      .expect((res: Response) => {
        const message = res.body.message;
        const friends = res.body.friends;
        const notification = res.body.notification;
        const newNotification = res.body.newNotification;
        expect(message).toBe("Successfully accepted the friend request");
        expect(friends.length).toBe(2);
        expect(notification.status).toBe("ACCEPTED");
        expect(newNotification.type).toBe("REQUESTUPDATE");
        notificationsToDelete.push(newNotification);
      })
      .expect(200, done);
  });
});

describe("Test user_friends_get controller", () => {
  let userFriends: UserFriendData[] = [];
  let userLastFriend: UserFriendData | null = null;

  beforeAll(async () => {
    userFriends = await getUserFriends({
      username: "seeduser1",
      limit: 30,
    });
    userLastFriend = await getUserLastFriend({
      username: "seeduser1",
      orderBy: "desc",
    });
  });

  test(
    "Return 401 authentication error when trying to get user's friends while" +
      " being unauthenticated",
    done => {
      request(app)
        .get("/friends")
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch user's friends",
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
    "Failed to fetch user's friends when the cursor's username is" + " invalid",
    done => {
      agent
        .get(`/friends?cursor=${userFriends[0].friendId}_test@username`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const error = res.body.error;
          const cursorValidationErrorMessage = getValidationErrorMsg({
            error,
            field: "cursor",
          });
          expect(cursorValidationErrorMessage).toBe("Cursor value is invalid");
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to fetch user's friends when the cursor's id is" + " invalid",
    done => {
      agent
        .get(`/friends?cursor=testid1_${userFriends[0].friend.username}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const error = res.body.error;
          const cursorValidationErrorMessage = getValidationErrorMsg({
            error,
            field: "cursor",
          });
          expect(cursorValidationErrorMessage).toBe("Cursor value is invalid");
        })
        .expect(422, done);
    },
  );

  test(
    "Failed to fetch user's friends when the limit is not a" + " number",
    done => {
      agent
        .get("/friends?limit=testlimit1")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const error = res.body.error;
          const limitValidationErrorMessage = getValidationErrorMsg({
            error,
            field: "limit",
          });
          expect(limitValidationErrorMessage).toBe(
            "Limit must be an integer and between 1 and 100",
          );
        })
        .expect(422, done);
    },
  );

  test("Failed to fetch user's friends when the limit is a decimal", done => {
    agent
      .get("/friends?limit=1.0")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const error = res.body.error;
        const limitValidationErrorMessage = getValidationErrorMsg({
          error,
          field: "limit",
        });
        expect(limitValidationErrorMessage).toBe(
          "Limit must be an integer and between 1 and 100",
        );
      })
      .expect(422, done);
  });

  test("Failed to fetch user's friends when the limit is less than 1", done => {
    agent
      .get("/friends?limit=0")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const error = res.body.error;
        const limitValidationErrorMessage = getValidationErrorMsg({
          error,
          field: "limit",
        });
        expect(limitValidationErrorMessage).toBe(
          "Limit must be an integer and between 1 and 100",
        );
      })
      .expect(422, done);
  });

  test(
    "Failed to fetch user's friends when the limit is more than" + " 100",
    done => {
      agent
        .get("/friends?limit=101")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const error = res.body.error;
          const limitValidationErrorMessage = getValidationErrorMsg({
            error,
            field: "limit",
          });
          expect(limitValidationErrorMessage).toBe(
            "Limit must be an integer and between 1 and 100",
          );
        })
        .expect(422, done);
    },
  );

  test("Successfully fetch user's friends if validation passed", done => {
    agent
      .get("/friends")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        expect(message).toBe("Successfully fetched user's friends");
      })
      .expect(200, done);
  });

  test("Return 30 friends if limit query is empty", done => {
    agent
      .get("/friends")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;
        expect(friends.length).toBe(30);
      })
      .expect(200, done);
  });

  test("Return 2 friends if limit query is 2", done => {
    agent
      .get("/friends?limit=2")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const friends = res.body.friends;
        expect(friends.length).toBe(2);
      })
      .expect(200, done);
  });

  test("Return the correct cursor", done => {
    agent
      .get("/friends?limit=10")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const cursor = res.body.nextCursor;
        const friendCursor = constructFriendCursor({
          id: userFriends[9].friendId,
          username: userFriends[9].friend.username,
        });
        expect(cursor).toBe(friendCursor);
      })
      .expect(200, done);
  });

  test(
    "The returned friends's usernames must be bigger the query's cursor's" +
      " username",
    done => {
      const currentFriend = userFriends[10];
      const cursorQuery = constructFriendCursor({
        id: currentFriend.friendId,
        username: currentFriend.friend.username,
      });

      agent
        .get(`/friends?limit=10&cursor=${cursorQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const friends: UserFriendData[] = res.body.friends;

          for (const friend of friends) {
            expect(
              friend.friend.username >= currentFriend.friend.username,
            ).toBeTruthy();
          }
        })
        .expect(200, done);
    },
  );

  test(
    "The returned friends's ids should be bigger than query cursor's id" +
      " if the friend's username is equal to query cursor's username",
    done => {
      const currentFriend = userFriends[10];
      const cursorQuery = constructFriendCursor({
        id: currentFriend.friendId,
        username: currentFriend.friend.username,
      });

      agent
        .get(`/friends?limit=10&cursor=${cursorQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const friends: UserFriendData[] = res.body.friends;

          for (const friend of friends) {
            if (friend.friend.username === currentFriend.friend.username) {
              expect(friend.friendId >= currentFriend.friendId).toBeTruthy();
            }
          }
        })
        .expect(200, done);
    },
  );

  test(
    "The returned nextCursor should be false if friends' length is less than" +
      " limit",
    done => {
      const cursorQuery = constructFriendCursor({
        id: userLastFriend?.friendId as string,
        username: userLastFriend?.friend.username as string,
      });

      agent
        .get(`/friends?limit=10&cursor=${cursorQuery}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const nextCursor = res.body.nextCursor;
          expect(nextCursor).toBe(false);
        })
        .expect(200, done);
    },
  );
});
