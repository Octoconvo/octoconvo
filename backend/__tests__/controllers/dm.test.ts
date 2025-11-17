import request from "supertest";
import app from "../../config/testConfig";
import TestAgent from "supertest/lib/agent";
import { login } from "../../utils/testUtils";
import { Response } from "supertest";
import { DirectMessage } from "@prisma/client";

describe("Test user DMs get controller", () => {
  test(
    "Return 401 unauthorized error when accessing DMs without being" +
      " authenticated",
    done => {
      request(app)
        .get("/direct-messages")
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch user's DMs",
          error: {
            message: "You are not authenticated",
          },
        })
        .expect(401, done);
    },
  );

  const agent: TestAgent = request.agent(app);
  login(agent, {
    username: "seeduser1",
    password: "seed@User1",
  });

  test(
    "Return success 200 when when successfully fetched user's direct" +
      " messages",
    done => {
      agent
        .get("/direct-messages")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          expect(message).toBe("Successfully fethed user's direct messages");
        })
        .expect(200, done);
    },
  );

  test(`Return 99 direct messages when logged in as seeduser1`, done => {
    agent
      .get("/direct-messages")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const directMessages: DirectMessage[] = res.body.directMessages;
        expect(directMessages.length).toBe(99);
      })
      .expect(200, done);
  });

  const agentTwo: TestAgent = request.agent(app);
  login(agentTwo, {
    username: "seeduser2",
    password: "seed@User2",
  });

  test(`Return 1 direct messages when logged in as seeduser2`, (done: jest.DoneCallback) => {
    agentTwo
      .get("/direct-messages")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const directMessages: DirectMessage[] = res.body.directMessages;
        expect(directMessages.length).toBe(1);
      })
      .expect(200, done);
  });
});
