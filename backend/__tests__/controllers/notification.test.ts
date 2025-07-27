import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import prisma from "../../database/prisma/client";
import { Notification } from "@prisma/client";
import { isISOString } from "../../utils/validation";

describe(
  "Test user's unread notification count get controller with" + " seeduser1",
  () => {
    let notificationsCount: number = 0;

    beforeAll(async () => {
      try {
        notificationsCount = await prisma.notification.count({
          where: {
            triggeredFor: {
              username: "seeduser1",
            },
          },
        });
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    });
    test(
      "Return 401 unauthorized if user tries to get unread notification count" +
        " without being unauthenticated",
      done => {
        request(app)
          .get("/notification/unread-count")
          .expect("Content-Type", /json/)
          .expect({
            message: "Failed to fetch user's unread notification count",
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
      "Successfully fetch user's unread notification count when the user" +
        " is authenticated",
      done => {
        agent
          .get("/notification/unread-count")
          .expect("Content-Type", /json/)
          .expect((res: Response) => {
            const message = res.body.message;
            const unreadNotificationCount = res.body.unreadNotificationCount;

            expect(message).toBe(
              "Successfully fetched user's unread notification count",
            );
            expect(unreadNotificationCount).toBeDefined();
          })
          .expect(200, done);
      },
    );

    test("The returned unread notification count should be correct", done => {
      agent
        .get("/notification/unread-count")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const unreadNotificationCount = res.body.unreadNotificationCount;

          expect(unreadNotificationCount).toBe(
            notificationsCount < 100 ? notificationsCount : 100,
          );
        })
        .expect(200, done);
    });
  },
);

describe(
  "Test user's unread notification count get controller with" + " seeduser2",
  () => {
    const agent = request.agent(app);
    login(agent, {
      username: "seeduser2",
      password: "seed@User2",
    });

    test(
      "The returned unread notification count should be 0 if the user is" +
        " authenticated",
      done => {
        agent
          .get("/notification/unread-count")
          .expect("Content-Type", /json/)
          .expect((res: Response) => {
            const unreadNotificationCount = res.body.unreadNotificationCount;

            expect(unreadNotificationCount).toBe(0);
          })
          .expect(200, done);
      },
    );
  },
);

describe("Test notifications GET controller", () => {
  let seedNotifications: Notification[] = [];

  beforeAll(async () => {
    try {
      seedNotifications = await prisma.notification.findMany({
        where: {
          triggeredFor: {
            username: "seeduser1",
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
          { id: "desc" },
        ],
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  });

  test("Return 401 unauthenticated if the user is not authenticated", done => {
    request(app)
      .get("/notifications")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch user's notifications",
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

  test("Return 422 error when the limit query is invalid", done => {
    agent
      .get("/notifications?limit=0.1")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch user's notifications");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "limit",
          ).msg,
        ).toBe("Limit must be an integer and between 1 and 100");
      })
      .expect(422, done);
  });

  test("Return 422 error when the cursor's id is invalid", done => {
    const ISOString = seedNotifications?.length
      ? new Date(seedNotifications[0]?.createdAt).toISOString()
      : "";

    agent
      .get(`/notifications?cursor=testid1_${ISOString}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch user's notifications");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "cursor",
          ).msg,
        ).toBe("Cursor value is invalid");
      })
      .expect(422, done);
  });

  test("Return 422 error when the cursor's createdAt is invalid", done => {
    const id = seedNotifications?.length ? seedNotifications[0].id : "";

    agent
      .get(`/notifications?cursor=${id}_testcreatedAt1`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch user's notifications");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "cursor",
          ).msg,
        ).toBe("Cursor value is invalid");
      })
      .expect(422, done);
  });

  test("Return 422 error when the cursor's string is invalid", done => {
    agent
      .get(`/notifications?cursor=testcursor1`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch user's notifications");
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "cursor",
          ).msg,
        ).toBe("Cursor value is invalid");
      })
      .expect(422, done);
  });

  test("Return 100 notifications if the limit query param is undefined", done => {
    agent
      .get(`/notifications`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const notifications = res.body.notifications;

        expect(message).toBe("Successfully fetched user's notifications");
        expect(notifications.length).toBe(100);
      })
      .expect(200, done);
  });

  test("Return 10 notifications if the limit query param is 10", done => {
    agent
      .get(`/notifications?limit=10`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const notifications = res.body.notifications;

        expect(message).toBe("Successfully fetched user's notifications");
        expect(notifications.length).toBe(10);
      })
      .expect(200, done);
  });

  test("Return the correct notifications with cursor query param", done => {
    // Use the tenth notification in the notifications list
    const createdAt =
      seedNotifications && seedNotifications[9]?.createdAt
        ? new Date(seedNotifications[9].createdAt).toISOString()
        : "";
    const id =
      seedNotifications && seedNotifications[9]?.id
        ? seedNotifications[9].id
        : "";
    const cursor = `${id}` + "_" + createdAt;

    agent
      .get(`/notifications?limit=10&cursor${cursor}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const notifications = res.body.notifications;

        expect(notifications.length).toBe(10);
        for (const notification of seedNotifications) {
          expect(notification.createdAt < seedNotifications[9].createdAt);
          if (notification.createdAt === seedNotifications[9].createdAt) {
            expect(notification.id < seedNotifications[9].id);
          }
        }
      })
      .expect(200, done);
  });

  test("Return the correct nextCursor", done => {
    agent
      .get(`/notifications?limit=10`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const nextCursor = res.body.nextCursor;

        const createdAt =
          seedNotifications && seedNotifications[9]?.createdAt
            ? new Date(seedNotifications[9].createdAt).toISOString()
            : "";
        const id =
          seedNotifications && seedNotifications[9]?.id
            ? seedNotifications[9].id
            : "";
        const cursor = `${id}` + "_" + createdAt;

        expect(nextCursor).toBe(cursor);
      })
      .expect(200, done);
  });

  test(
    "NextCursor should be false if the returned notifications is less" +
      " than limit",
    done => {
      const lastIndex = seedNotifications
        ? seedNotifications.length - 1 - 10
        : 0;
      const createdAt =
        seedNotifications && seedNotifications[lastIndex]?.createdAt
          ? new Date(seedNotifications[lastIndex].createdAt).toISOString()
          : "";
      const id =
        seedNotifications && seedNotifications[lastIndex]?.id
          ? seedNotifications[lastIndex].id
          : "";
      const cursor = `${id}` + "_" + `${createdAt}`;
      agent
        .get(`/notifications?limit=20&cursor=${cursor}`)
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const nextCursor = res.body.nextCursor;
          expect(isISOString(createdAt)).toBeTruthy();
          expect(nextCursor).toBe(false);
        })
        .expect(200, done);
    },
  );
});
