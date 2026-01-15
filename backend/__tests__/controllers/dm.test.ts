import request from "supertest";
import app from "../../config/testConfig";
import TestAgent from "supertest/lib/agent";
import { getValidationErrorMsg, login } from "../../utils/testUtils";
import { Response } from "supertest";
import { DirectMessage, Inbox } from "@prisma/client";
import { UserDMsGETResponse } from "../../@types/apiResponse";
import { getDMByParticipants } from "../../database/prisma/testQueries";
import { ErrorResponse } from "../../@types/error";

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

  test(`The returned data has correct properties`, done => {
    agent
      .get("/direct-messages")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const directMessages: UserDMsGETResponse[] = res.body.directMessages;

        for (const DM of directMessages) {
          expect(DM.inbox?.id).toBeDefined();
          expect(DM.recipient.id).toBeDefined();
          expect(DM.recipient).toBeDefined();
          expect(DM.lastMessage).toBeDefined();
        }
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

describe("Test DM get controller", () => {
  let DM:
    | null
    | (DirectMessage & {
        inbox: Inbox | null;
      }) = null;

  beforeAll(async () => {
    DM = await getDMByParticipants({
      usernameOne: "seeduser1",
      usernameTwo: "seeduser11",
    });
  });

  test(
    "Return 401 unauthorized error when accessing DM without being" +
      " authenticated",
    done => {
      request(app)
        .get(`/direct-message/${DM?.id}`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch DM with that id",
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

  test("Return 422 error when DM id is invalid", done => {
    agent
      .get("/direct-message/testdmid")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const validationError: ErrorResponse = res.body.error;

        expect(message).toBe("Failed to fetch DM with that id");
        expect(
          getValidationErrorMsg({
            field: "directmessageid",
            error: validationError,
          }),
        ).toBe("DM id is invalid");
      })
      .expect(422, done);
  });

  test("Return 404 error when DM is not found", done => {
    agent
      .get(`/direct-message/${DM?.inbox?.id}`)
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch DM with that id",
        error: {
          message: "Can't find DM with that id",
        },
      })
      .expect(404, done);
  });

  const agent403: TestAgent = request.agent(app);
  login(agent403, {
    username: "seeduser2",
    password: "seed@User2",
  });

  test(
    "Return 403 error when the user is not authorised to access the" + " DM",
    done => {
      agent403
        .get(`/direct-message/${DM?.id}`)
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch DM with that id",
          error: {
            message: "You are not authorised to access this DM",
          },
        })
        .expect(403, done);
    },
  );

  test("Successfully fetched DM after successful validation", done => {
    agent
      .get(`/direct-message/${DM?.id}`)
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const msg: string = res.body.message;
        const DM = res.body.directMessage;

        expect(msg).toBe("Successfully fetched DM with that id");
        expect(DM).toBeDefined();
      })
      .expect(200, done);
  });
});
