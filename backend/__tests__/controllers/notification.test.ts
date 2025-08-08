import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import prisma from "../../database/prisma/client";
import { Notification, User } from "@prisma/client";
import { isISOString } from "../../utils/validation";
import { NotificationRes } from "../../@types/apiResponse";

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

describe("Test notification_update_read_status POST controller", () => {
  let seedUser1: User | null = null;
  let notifications: Notification[] = [];

  beforeAll(async () => {
    try {
      seedUser1 = await prisma.user.findUnique({
        where: {
          username: "seeduser1",
        },
      });

      if (seedUser1) {
        notifications = await prisma.notification.findMany({
          where: {
            triggeredForId: seedUser1.id,
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  });

  afterEach(async () => {
    // Reset all updated notifications' read statuses to false
    if (seedUser1) {
      await prisma.notification.updateMany({
        where: {
          triggeredForId: seedUser1.id,
        },
        data: {
          isRead: false,
        },
      });
    }
  });

  test(
    "Return 401 authentication error when trying to udate notifications'" +
      " read statuses when the user is not authenticated",
    done => {
      request(app)
        .post("/notifications/update-read-status?mode=ALERT")
        .send({
          startdate: notifications[0]?.createdAt,
          enddate: notifications[0]?.createdAt,
        })
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to update user's notifications' read statuses",
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

  test("Return 422 HTTP error when the startdate field is empty", done => {
    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: "",
        enddate: notifications[0]?.createdAt,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe(
          "Failed to update user's notifications' read statuses",
        );
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "startdate",
          ).msg,
        ).toBe("The starting date cannot be empty");
      })
      .expect(422, done);
  });

  test(
    "Return 422 HTTP error when the startdate field is not an ISO" + " string",
    done => {
      agent
        .post("/notifications/update-read-status?mode=ALERT")
        .send({
          startdate: "teststartdate1",
          enddate: notifications[0]?.createdAt,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe(
            "Failed to update user's notifications' read statuses",
          );
          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "startdate",
            ).msg,
          ).toBe("The starting date is invalid");
        })
        .expect(422, done);
    },
  );

  test(
    "Return 422 HTTP error when the enddate field is not an ISO" + " string",
    done => {
      agent
        .post("/notifications/update-read-status?mode=ALERT")
        .send({
          startdate: "teststartdate1",
          enddate: "testenddate1",
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe(
            "Failed to update user's notifications' read statuses",
          );

          expect(
            error.validationError.find(
              (obj: { field: string; msg: string; value: string }) =>
                obj.field === "enddate",
            ).msg,
          ).toBe("The end date is invalid");
        })
        .expect(422, done);
    },
  );

  test("Return 422 HTTP error when the mode is neither ALERT or SILENT", done => {
    agent
      .post("/notifications/update-read-status?mode=testmode1")
      .send({
        startdate: notifications[0].createdAt,
        enddate: notifications[0]?.createdAt,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe(
          "Failed to update user's notifications' read statuses",
        );
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "mode",
          ).msg,
        ).toBe("Mode must either be SILENT or ALERT");
      })
      .expect(422, done);
  });

  test("Return 200 success if everything is valid in SILENT mode", done => {
    agent
      .post("/notifications/update-read-status?mode=SILENT")
      .send({
        startdate: notifications[0].createdAt,
        enddate: notifications[0]?.createdAt,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;

        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in SILENT mode",
        );
      })
      .expect(200, done);
  });

  test("Return 200 success if everything is valid in ALERT mode", done => {
    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: notifications[0].createdAt,
        enddate: notifications[0]?.createdAt,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in ALERT mode",
        );
      })
      .expect(200, done);
  });

  test(
    "Update the correct notifications which createAt fields are less than" +
      " or equal the startdate and greater than or equal the enddate value",
    done => {
      const startDate = notifications[0].createdAt;
      const endDate = notifications[9].createdAt;

      agent
        .post("/notifications/update-read-status?mode=ALERT")
        .send({
          startdate: startDate,
          enddate: endDate,
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const updatedNotifications = res.body.notifications;

          expect(message).toBe(
            "Successfully updated user's notifications' read statuses" +
              " in ALERT mode",
          );

          expect(updatedNotifications.length).toBe(10);
          for (const updatedNotification of updatedNotifications) {
            expect(
              new Date(updatedNotification.createdAt) >= new Date(endDate),
            ).toBeTruthy();
            expect(
              new Date(updatedNotification.createdAt) <= new Date(startDate),
            ).toBeTruthy();
          }
        })
        .expect(200, done);
    },
  );

  test("Check that all notifications' isRead fields are true", done => {
    const startDate = notifications[0].createdAt;
    const endDate = notifications[9].createdAt;

    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: startDate,
        enddate: endDate,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const updatedNotifications = res.body.notifications;

        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in ALERT mode",
        );

        expect(updatedNotifications.length).toBeTruthy();
        for (const updatedNotification of updatedNotifications) {
          expect(updatedNotification.isRead).toBeTruthy();
        }
      })
      .expect(200, done);
  });

  test("Ensure the notifications returned contains triggeredBy's username", done => {
    const startDate = notifications[0].createdAt;
    const endDate = notifications[9].createdAt;

    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: startDate,
        enddate: endDate,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const updatedNotifications: NotificationRes[] = res.body.notifications;

        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in ALERT mode",
        );

        updatedNotifications.forEach((notif: NotificationRes) => {
          expect(notif.triggeredBy.username).toBeTruthy();
        });
      })
      .expect(200, done);
  });

  test("Ensure the notifications returned contains triggeredFor's username", done => {
    const startDate = notifications[0].createdAt;
    const endDate = notifications[9].createdAt;

    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: startDate,
        enddate: endDate,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const updatedNotifications: NotificationRes[] = res.body.notifications;

        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in ALERT mode",
        );

        updatedNotifications.forEach((notif: NotificationRes) => {
          expect(notif.triggeredFor.username).toBeTruthy();
        });
      })
      .expect(200, done);
  });

  test("Ensure the notifications returned contains community's name", done => {
    const startDate = notifications[0].createdAt;
    const endDate = notifications[9].createdAt;

    agent
      .post("/notifications/update-read-status?mode=ALERT")
      .send({
        startdate: startDate,
        enddate: endDate,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const updatedNotifications: NotificationRes[] = res.body.notifications;

        expect(message).toBe(
          "Successfully updated user's notifications' read statuses" +
            " in ALERT mode",
        );

        updatedNotifications.forEach((notif: NotificationRes) => {
          expect(
            notif.community === null || notif.community?.name.length > 0,
          ).toBeTruthy();
        });
      })
      .expect(200, done);
  });
});
