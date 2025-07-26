import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";

describe(
  "Test user's unread notification count get controller with" + " seeduser1",
  () => {
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

    test(
      "The returned unread notification should be 5 if the user is" +
        " authenticated",
      done => {
        agent
          .get("/notification/unread-count")
          .expect("Content-Type", /json/)
          .expect((res: Response) => {
            const unreadNotificationCount = res.body.unreadNotificationCount;

            expect(unreadNotificationCount).toBe(5);
          })
          .expect(200, done);
      },
    );
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
      "The returned unread notification should be 0 if the user is" +
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
