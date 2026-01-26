import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { getValidationErrorMsg, login } from "../../utils/testUtils";
import prisma from "../../database/prisma/client";
import { console } from "node:inspector";
import { Attachment, Community, Inbox, Message } from "@prisma/client";
import { deleteAllMessageByContent } from "../../database/prisma/messageQueries";
import { getLastIndexToBase10 } from "../../utils/numberUtils";
import {
  deleteMessageAndItsDataById,
  getDMByParticipants,
  getMessagesByInboxId,
} from "../../database/prisma/testQueries";
import { DMWithInbox } from "../../@types/database";
import { constructMessageCursor } from "../../utils/cursor";

jest.mock("../../database/supabase/supabaseQueries", () => ({
  uploadFile: async ({
    folder,
    file,
    bucketName,
  }: {
    folder: string;
    file: Express.Multer.File;
    bucketName: string;
  }) => {
    const promiseData = {
      path: `${folder}/${file.originalname}`,
      fullPath: `${bucketName}/${folder}/${file.originalname}`,
    };

    type PromiseData = {
      data: { path: string; fullPath: string };
    };

    //eslint-disable-next-line
    const promise = new Promise<PromiseData>((resolve, reject) => {
      resolve({ data: promiseData });
    });

    const { data } = await promise.then(data => {
      return data;
    });

    return data;
  },
  getPublicURL: ({
    path,
    bucketName,
  }: {
    path: string;
    bucketName: string;
  }) => {
    return {
      publicUrl:
        "https://mqzsctdttuxrgvlpthvy.supabase.co/storage/v1/object/public/" +
        `${bucketName}/${path}`,
    };
  },
}));

describe("Test message post controller", () => {
  type CommunityGET = Community & {
    inbox: Inbox;
  };
  let community1: CommunityGET | null = null;
  let community2: CommunityGET | null = null;
  let communityPending: CommunityGET | null = null;

  beforeAll(async () => {
    try {
      community1 = (await prisma.community.findUnique({
        where: {
          name: "seedcommunity1",
        },
        include: {
          inbox: true,
        },
      })) as CommunityGET;

      community2 = (await prisma.community.findUnique({
        where: {
          name: "seedcommunity2",
        },
        include: {
          inbox: true,
        },
      })) as CommunityGET;

      const pendingParticipant = await prisma.participant.findFirst({
        where: {
          user: {
            username: "seeduser1",
          },
          status: "PENDING",
          NOT: {
            communityId: null,
          },
        },
        include: {
          user: true,
        },
      });

      if (pendingParticipant && pendingParticipant.communityId) {
        communityPending = (await prisma.community.findUnique({
          where: {
            id: pendingParticipant?.communityId,
          },
          include: {
            inbox: true,
          },
        })) as CommunityGET;
      }
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async () => {
    try {
      const messages = ["testmessage1", "testmessage2"];

      for (const message of messages) {
        deleteAllMessageByContent(message);
      }
    } catch (err) {
      console.log(err);
    }
  });

  test(
    "Return 401 unauthorized if user tries to create a message without" +
      " being authenticated",
    done => {
      request(app)
        .post("/message")
        .type("form")
        .send({
          content: "hi",
          inboxid: "i",
        })
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to create message",
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

  test("Return 422 error when user create a message without content", done => {
    agent
      .post("/message")
      .type("form")
      .send({
        content: "",
        inboxid: "testmessage1",
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "content",
          ).msg,
        ).toBe("Message is required");
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when user create a message with invalid inbox id", done => {
    agent
      .post("/message")
      .type("form")
      .send({
        content: "testmessage1",
        inboxid: "testmessage1",
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "inboxid",
          ).msg,
        ).toBe("Invalid inbox id");
      })
      .expect(422)
      .end(done);
  });

  test("Return 403 error when user send a message to unauthorized community", done => {
    agent
      .post("/message")
      .type("form")
      .send({
        content: "tesmessage1",
        inboxid: community2?.inbox.id,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).not.toBeDefined();
        expect(error.message).toBe("You are not a member of this community");
      })
      .expect(403)
      .end(done);
  });

  test("Return 404 error when user send a message to an inbox that doesn't exist", done => {
    agent
      .post("/message")
      .type("form")
      .send({
        content: "tesmessage1",
        inboxid: community2?.id,
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).not.toBeDefined();
        expect(error.message).toBe("The recipient's inbox doesn't exist");
      })
      .expect(404)
      .end(done);
  });

  test("Return 422 error when user message's attachment mimetype is invalid", done => {
    agent
      .post("/message")
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .field("inboxid", community1?.inbox.id || "")
      .attach("attachments", __dirname + "/../assets/test-img-invalid-01.svg")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "attachments",
          ).msg,
        ).toBe("Message attachments can only be in jpeg, png, or gif format");
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when user message's attacment size exceeds size limit", done => {
    agent
      .post("/message")
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .field("inboxid", community1?.inbox.id || "")
      .attach("attachments", __dirname + "/../assets/testimageexceed10mb.png")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "attachments",
          ).msg,
        ).toBe("Individual file in attachments must not exceed 5 MB");
      })
      .expect(413)
      .end(done);
  });

  test("Return 422 error when user message's total assigments size exceeds size limit", done => {
    agent
      .post("/message")
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .field("inboxid", community1?.inbox.id || "")
      .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
      .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
      .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
      .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create message");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "attachments",
          ).msg,
        ).toBe("Message attachments total size must not exceed 10 MB");
      })
      .expect(422)
      .end(done);
  });

  test("Successfully created the message with attachments", done => {
    agent
      .post("/message")
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .field("inboxid", community1?.inbox.id || "")
      .attach("attachments", __dirname + "/../assets/test-img-valid-01.jpg")
      .attach("attachments", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const messageData = res.body.messageData;

        expect(message).toBe("Successfully created message");
        expect(messageData).toBeDefined();
        expect(messageData.attachments).toBeDefined();
        expect(messageData.attachments[0].url).toContain(
          `/attachment/${community1?.inbox.id}/`,
        );
        expect(messageData.attachments[0].thumbnailUrl).toContain(
          `/attachment/${community1?.inbox.id}/`,
        );
      })
      .expect(200)
      .end(done);
  });

  test("Successfully created the message if all fields are valid", done => {
    agent
      .post("/message")
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .field("inboxid", community1?.inbox.id || "")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const messageData = res.body.messageData;

        expect(message).toBe("Successfully created message");
        expect(messageData).toBeDefined();
        expect(messageData.inboxId).toBe(community1?.inbox.id);
      })
      .expect(200)
      .end(done);
  });

  test(
    "Failed to create the message if the user participation status" +
      " is still PENDING",
    done => {
      agent
        .post("/message")
        .set("Content-type", "multipart/form-data")
        .accept("application/json")
        .field("content", "testmessage1")
        .field("inboxid", communityPending?.inbox.id || "")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create message");
          expect(error.message).toBe("You are not a member of this community");
        })
        .expect(403)
        .end(done);
    },
  );
});

describe("Test messages get controller", () => {
  type CommunityGET = Community & {
    inbox: Inbox;
  };
  let community1: CommunityGET | null = null;
  let community2: CommunityGET | null = null;
  let communityPending: CommunityGET | null = null;
  let messages1: Message[] = [];

  beforeAll(async () => {
    try {
      community1 = (await prisma.community.findUnique({
        where: {
          name: "seedcommunity1",
        },
        include: {
          inbox: true,
        },
      })) as CommunityGET;

      community2 = (await prisma.community.findUnique({
        where: {
          name: "seedcommunity2",
        },
        include: {
          inbox: true,
        },
      })) as CommunityGET;

      messages1 = await prisma.message.findMany({
        where: {
          inboxId: community1.inbox.id,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });

      const pendingParticipant = await prisma.participant.findFirst({
        where: {
          user: {
            username: "seeduser1",
          },
          status: "PENDING",
          NOT: {
            communityId: null,
          },
        },
        include: {
          user: true,
        },
      });

      if (pendingParticipant && pendingParticipant.communityId) {
        communityPending = (await prisma.community.findUnique({
          where: {
            id: pendingParticipant?.communityId,
          },
          include: {
            inbox: true,
          },
        })) as CommunityGET;
      }
    } catch (err) {
      console.error(err);
    }
  });

  test(
    "Return 401 unauthorized if user tries to get messages without" +
      " being authenticated",
    done => {
      request(app)
        .get("/inbox/textinbox1/messages")
        .type("form")
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch messages",
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

  test("Return 422 error when inbox ID  is invalid", done => {
    agent
      .get("/inbox/testinbox1/messages?limit=0.1")
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "inboxid",
          ).msg,
        ).toBe("Invalid inbox id");
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when limit query is invalid", done => {
    agent
      .get("/inbox/testinbox1/messages?limit=0.1")
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "limit",
          ).msg,
        ).toBe("Limit must be an integer between 1 and 100");
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when cursor query is invalid", done => {
    agent
      .get("/inbox/testinbox1/messages?cursor=testcursor1_testcursor1")
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "cursor",
          ).msg,
        ).toBe("Cursor value is invalid");
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when direction query is invalid", done => {
    agent
      .get("/inbox/testinbox1/messages?direction=test")
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(
          error.validationError.find(
            (obj: { field: string; msg: string; value: string }) =>
              obj.field === "direction",
          ).msg,
        ).toBe("Cursor direction must be either backward or forward");
      })
      .expect(422)
      .end(done);
  });

  test("Return 403 error when user is not authorized to access the inbox", done => {
    agent
      .get(`/inbox/${community2?.inbox.id}/messages`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch messages",
        error: {
          message: "You are not a member of this community",
        },
      })
      .expect(403)
      .end(done);
  });

  test("Return 403 error when user participation status is PENDING", done => {
    agent
      .get(`/inbox/${communityPending?.inbox.id}/messages`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch messages",
        error: {
          message: "You are not a member of this community",
        },
      })
      .expect(403)
      .end(done);
  });

  test("Return 404 error when inbox doesn't exist", done => {
    agent
      .get(`/inbox/${community1?.id}/messages`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch messages",
        error: {
          message: "The inbox doesn't exist",
        },
      })
      .expect(404)
      .end(done);
  });

  test("Return two messages when limit query is 2", done => {
    agent
      .get(`/inbox/${community1?.inbox.id}/messages?limit=2`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message = res.body.message;
        const messagesData = res.body.messagesData;

        expect(message).toBe(
          `Successfully fetched messages from inbox ${community1?.inbox.id}`,
        );
        expect(messagesData).toBeDefined();
        expect(messagesData.length).toBe(2);
      })
      .expect(200)
      .end(done);
  });

  test("Return correct cursor when the direction query is backward", done => {
    const lastIndex = getLastIndexToBase10(messages1.length);

    agent
      .get(`/inbox/${community1?.inbox.id}/messages?direction=backward&limit=2`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor = res.body.prevCursor;
        const nextCursor = res.body.nextCursor;

        // expect(lastMessage.content).toBe(res.body.messagesData[0].content);
        expect(prevCursor).toBe(
          `${messages1[lastIndex - 1].id}` +
            "_" +
            `${new Date(messages1[lastIndex - 1].createdAt).toISOString()}`,
        );

        expect(nextCursor).toBe(
          `${messages1[lastIndex].id}` +
            "_" +
            `${new Date(messages1[lastIndex].createdAt).toISOString()}`,
        );
      })
      .expect(200)
      .end(done);
  });

  test("Return correct cursor when the direction query is forward", done => {
    agent
      .get(`/inbox/${community1?.inbox.id}/messages?direction=forward&limit=2`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor = res.body.prevCursor;
        const nextCursor = res.body.nextCursor;

        expect(prevCursor).toBe(
          `${messages1[0].id}_${new Date(messages1[0].createdAt).toISOString()}`,
        );

        expect(nextCursor).toBe(
          `${messages1[1].id}_${new Date(messages1[1].createdAt).toISOString()}`,
        );
      })
      .expect(200)
      .end(done);
  });

  test("Return null prev cursor when messages data less than limit", done => {
    const cursor =
      `${messages1[2].id}` +
      "_" +
      `${new Date(messages1[2].createdAt).toISOString()}`;

    agent
      .get(
        `/inbox/${community1?.inbox.id}/messages?cursor=${cursor}&direction=backward&limit=5`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor = res.body.prevCursor;

        expect(prevCursor).toBeNull();
      })
      .expect(200)
      .end(done);
  });

  test("Return null next cursor when messages data less than limit", done => {
    const cursor =
      `${messages1[messages1.length - 2].id}` +
      "_" +
      `${new Date(messages1[messages1.length - 2].createdAt).toISOString()}`;

    agent
      .get(
        `/inbox/${community1?.inbox.id}/messages?cursor=${cursor}&direction=forward&limit=5`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const nextCursor = res.body.nextCursor;

        expect(nextCursor).toBeNull();
      })
      .expect(200)
      .end(done);
  });

  test("Return correct messages with cursor and backward direction", done => {
    const cursor =
      `${messages1[10].id}` +
      "_" +
      `${new Date(messages1[10].createdAt).toISOString()}`;

    agent
      .get(
        `/inbox/${community1?.inbox.id}/messages?cursor=${cursor}&direction=backward&limit=1`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const messagesData = res.body.messagesData;

        expect(messagesData[0].id).toBe(messages1[9].id);
      })
      .expect(200)
      .end(done);
  });

  test("Return correct messages with cursor and forward direction", done => {
    const cursor =
      `${messages1[10].id}` +
      "_" +
      `${new Date(messages1[10].createdAt).toISOString()}`;

    agent
      .get(
        `/inbox/${community1?.inbox.id}/messages?cursor=${cursor}&direction=forward&limit=1`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const messagesData = res.body.messagesData;

        expect(messagesData[0].id).toBe(messages1[11].id);
      })
      .expect(200)
      .end(done);
  });
});

describe("Test DM messages get controller", () => {
  let DM: DMWithInbox | null;
  // The DM's messages is sorted in Descending order (newest messages first).
  let DMMessages: Message[];

  beforeAll(async () => {
    try {
      DM = await getDMByParticipants({
        usernameOne: "seeduser1",
        usernameTwo: "seeduser2",
      });
      if (DM && DM.inbox) {
        DMMessages = await getMessagesByInboxId(DM?.inbox?.id);
      }
    } catch (err) {
      console.error(err);
    }
  });

  test(
    "Return 401 unauthorized if user tries to get DM messages without" +
      " being authenticated",
    done => {
      request(app)
        .get(`/direct-message/${DM?.id}/messages`)
        .type("form")
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to fetch messages",
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

  test("Return 422 error if DM id is invalid", done => {
    agent
      .get("/direct-message/testinbox1/messages?limit=1")
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(getValidationErrorMsg({ field: "directmessageid", error })).toBe(
          "DM id is invalid",
        );
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error if limit query is invalid", done => {
    agent
      .get(`/direct-message/${DM?.id}/messages?limit=0.1`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(getValidationErrorMsg({ field: "limit", error })).toBe(
          "Limit must be an integer between 1 and 100",
        );
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error when cursor query is invalid", done => {
    agent
      .get(`/direct-message/${DM?.id}/messages?cursor=testcursor1_testcursor1`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(getValidationErrorMsg({ field: "cursor", error })).toBe(
          "Cursor value is invalid",
        );
      })
      .expect(422)
      .end(done);
  });

  test("Return 422 error if direction query is invalid", done => {
    agent
      .get(`/direct-message/${DM?.id}/messages?direction=testdirection`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to fetch messages");
        expect(error.validationError).toBeDefined();
        expect(getValidationErrorMsg({ field: "direction", error })).toBe(
          "Cursor direction must be either backward or forward",
        );
      })
      .expect(422)
      .end(done);
  });

  const agent403 = request.agent(app);
  login(agent403, {
    username: "seeduser3",
    password: "seed@User3",
  });

  test("Return 403 error if user is not authorized to access the DM", done => {
    agent403
      .get(`/direct-message/${DM?.id}/messages`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch messages",
        error: {
          message: "You are not authorised to access this DM",
        },
      })
      .expect(403)
      .end(done);
  });

  test("Return 404 error if the DM doesn't exist", done => {
    agent
      .get(`/direct-message/${DM?.inbox?.id}/messages`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect({
        message: "Failed to fetch messages",
        error: {
          message: "DM doesn't exist",
        },
      })
      .expect(404)
      .end(done);
  });

  test("Return two messages when limit query is 2", done => {
    agent
      .get(`/direct-message/${DM?.id}/messages?limit=2`)
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const messagesData = res.body.messagesData;
        expect(message).toBe(`Successfully fetched messages`);
        expect(messagesData).toBeDefined();
        expect(messagesData.length).toBe(2);
      })
      .expect(200)
      .end(done);
  });

  test("Return correct cursor when the direction query is backward", done => {
    const limit: number = 2;
    agent
      .get(
        `/direct-message/${DM?.id}/messages?direction=backward&limit=${limit}`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor: string = res.body.prevCursor;
        const nextCursor: string = res.body.nextCursor;
        expect(prevCursor).toBe(
          constructMessageCursor({
            id: DMMessages[0].id,
            createdAt: DMMessages[0].createdAt,
          }),
        );

        expect(nextCursor).toBe(
          constructMessageCursor({
            id: DMMessages[limit - 1].id,
            createdAt: DMMessages[limit - 1].createdAt,
          }),
        );
      })
      .expect(200)
      .end(done);
  });

  test("Return correct cursor when the direction query is forward", done => {
    const limit: number = 2;
    const lastIndex: number = DMMessages.length - 1;
    agent
      .get(
        `/direct-message/${DM?.id}/messages?direction=forward&limit=${limit}`,
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor: string = res.body.prevCursor;
        const nextCursor: string = res.body.nextCursor;

        expect(prevCursor).toBe(
          constructMessageCursor({
            createdAt: DMMessages[lastIndex].createdAt,
            id: DMMessages[lastIndex].id,
          }),
        );

        expect(nextCursor).toBe(
          constructMessageCursor({
            id: DMMessages[lastIndex - limit + 1].id,
            createdAt: DMMessages[lastIndex - limit + 1].createdAt,
          }),
        );
      })
      .expect(200)
      .end(done);
  });

  test("Return null prev cursor when messages data less than limit", done => {
    const lastIndex: number = DMMessages.length - 1;
    const cursor: string = constructMessageCursor({
      id: DMMessages[lastIndex].id,
      createdAt: DMMessages[lastIndex].createdAt,
    });

    agent
      .get(
        `/direct-message/${DM?.id}/messages?cursor=${cursor}` +
          "&direction=backward&limit=5",
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const prevCursor: string | null = res.body.prevCursor;
        expect(prevCursor).toBeNull();
      })
      .expect(200)
      .end(done);
  });

  test("Return null next cursor when messages data less than limit", done => {
    const cursor: string = constructMessageCursor({
      id: DMMessages[0].id,
      createdAt: DMMessages[0].createdAt,
    });

    agent
      .get(
        `/direct-message/${DM?.id}/messages?cursor=${cursor}` +
          "&direction=forward&limit=5",
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const nextCursor: string | null = res.body.nextCursor;
        expect(nextCursor).toBeNull();
      })
      .expect(200)
      .end(done);
  });

  test(
    "Return correct messages using cursor and backward direction query" +
      " params",
    done => {
      const cursor: string = constructMessageCursor({
        id: DMMessages[10].id,
        createdAt: DMMessages[10].createdAt,
      });

      agent
        .get(
          `/direct-message/${DM?.id}/messages?cursor=${cursor}` +
            "&direction=backward&limit=1",
        )
        .type("form")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const error = res.body.error;
          expect(error).toBeUndefined();
          const messagesData = res.body.messagesData;
          expect(messagesData[0].content).toBe(DMMessages[11].content);
          expect(messagesData[0].content).toBe("seedmessage89");
        })
        .expect(200)
        .end(done);
    },
  );

  test("Return correct messages with cursor and forward direction", done => {
    const cursor: string = constructMessageCursor({
      id: DMMessages[10].id,
      createdAt: DMMessages[10].createdAt,
    });

    agent
      .get(
        `/direct-message/${DM?.id}/messages?cursor=${cursor}` +
          "&direction=forward&limit=1",
      )
      .type("form")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const messagesData = res.body.messagesData;
        expect(messagesData[0].id).toBe(DMMessages[9].id);
        expect(messagesData[0].content).toBe("seedmessage91");
      })
      .expect(200)
      .end(done);
  });
});

describe("Test DM message POST controller", () => {
  type MessageWithAttachments = Message & { attachments: Attachment[] };
  const createdDMMessages: MessageWithAttachments[] = [];
  let DM: DMWithInbox | null;

  beforeAll(async () => {
    try {
      DM = await getDMByParticipants({
        usernameOne: "seeduser1",
        usernameTwo: "seeduser2",
      });
    } catch (err) {
      console.error(err);
    }
  });

  afterAll(async () => {
    for (const message of createdDMMessages) {
      try {
        await deleteMessageAndItsDataById(message.id);
      } catch (err) {
        console.log(err);
      }
    }
  });

  test(
    "Return 401 unauthorized if user tries to create a DM message without" +
      " being authenticated",
    done => {
      request(app)
        .post(`/direct-message/${DM?.id}/message`)
        .type("form")
        .send({
          content: "testmessage1",
        })
        .expect("Content-Type", /json/)
        .expect({
          message: "Failed to create DM's message",
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

  test("Return 422 error when user create a message without content", done => {
    agent
      .post(`/direct-message/${DM?.id}/message`)
      .type("form")
      .send({
        content: "",
      })
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const error = res.body.error;

        expect(message).toBe("Failed to create DM's message");
        expect(error.validationError).toBeDefined();
        expect(getValidationErrorMsg({ error, field: "content" })).toBe(
          "Message is required",
        );
      })
      .expect(422)
      .end(done);
  });

  test(
    "Return 422 error when user create a message to an invalid DM's" + " id",
    done => {
      agent
        .post("/direct-message/testdirectmessageid/message")
        .type("form")
        .send({
          content: "testmessage1",
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.validationError).toBeDefined();
          expect(
            getValidationErrorMsg({ error, field: "directmessageid" }),
          ).toBe("DM id is invalid");
        })
        .expect(422)
        .end(done);
    },
  );

  test(
    "Return 422 error when user message's attachment mimetype is" + " invalid",
    done => {
      agent
        .post(`/direct-message/${DM?.id}/message`)
        .set("Content-type", "multipart/form-data")
        .accept("application/json")
        .field("content", "testmessage1")
        .attach("attachments", __dirname + "/../assets/test-img-invalid-01.svg")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.validationError).toBeDefined();
          expect(getValidationErrorMsg({ error, field: "attachments" })).toBe(
            "Message's attachments can only be in jpeg, png, or gif format",
          );
        })
        .expect(422)
        .end(done);
    },
  );

  test(
    "Return 413 error when user message's attacment size exceeds size" +
      " limit",
    done => {
      agent
        .post(`/direct-message/${DM?.id}/message`)
        .set("Content-type", "multipart/form-data")
        .accept("application/json")
        .field("content", "testmessage1")
        .attach("attachments", __dirname + "/../assets/testimageexceed10mb.png")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.validationError).toBeDefined();
          expect(getValidationErrorMsg({ error, field: "attachments" })).toBe(
            "Individual file in attachments must not exceed 5 MB",
          );
        })
        .expect(413)
        .end(done);
    },
  );

  test(
    "Return 422 error when user message's total assigments size exceeds size" +
      " limit",
    done => {
      agent
        .post(`/direct-message/${DM?.id}/message`)
        .set("Content-type", "multipart/form-data")
        .accept("application/json")
        .field("content", "testmessage1")
        .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
        .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
        .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
        .attach("attachments", __dirname + "/../assets/testimageexceed2mb.png")
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.validationError).toBeDefined();
          expect(getValidationErrorMsg({ error, field: "attachments" })).toBe(
            "Message attachments total size must not exceed 10 MB",
          );
        })
        .expect(422)
        .end(done);
    },
  );

  test(
    "Return 404 error when user send a message to a inbox that doesn't" +
      " exist",
    done => {
      agent
        .post(`/direct-message/${DM?.inbox?.id}/message`)
        .type("form")
        .send({
          content: "tesmessage1",
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.validationError).not.toBeDefined();
          expect(error.message).toBe("Can't find DM's inbox");
        })
        .expect(404)
        .end(done);
    },
  );

  const agent403 = request.agent(app);
  login(agent403, {
    username: "seeduser3",
    password: "seed@User3",
  });

  test(
    "Return 403 error when user is not authorised to create a message to" +
      " the DM",
    done => {
      agent403
        .post(`/direct-message/${DM?.id}/message`)
        .type("form")
        .send({
          content: "tesmessage1",
        })
        .expect("Content-Type", /json/)
        .expect((res: Response) => {
          const message: string = res.body.message;
          const error = res.body.error;

          expect(message).toBe("Failed to create DM's message");
          expect(error.message).toBe(
            "You are not authorised to create messages to this DM",
          );
        })
        .expect(403)
        .end(done);
    },
  );

  test("Successfully created the message if all fields are valid", done => {
    agent
      .post(`/direct-message/${DM?.id}/message`)
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const messageData: MessageWithAttachments = res.body.messageData;
        createdDMMessages.push(messageData);
        expect(message).toBe("Successfully created DM's message");
        expect(messageData).toBeDefined();
        expect(messageData.inboxId).toBe(DM?.inbox?.id);
      })
      .expect(200)
      .end(done);
  });

  test("Successfully created the message with attachments", done => {
    agent
      .post(`/direct-message/${DM?.id}/message`)
      .set("Content-type", "multipart/form-data")
      .accept("application/json")
      .field("content", "testmessage1")
      .attach("attachments", __dirname + "/../assets/test-img-valid-01.jpg")
      .attach("attachments", __dirname + "/../assets/test-img-valid-01.jpg")
      .expect("Content-Type", /json/)
      .expect((res: Response) => {
        const message: string = res.body.message;
        const messageData: MessageWithAttachments = res.body.messageData;

        expect(message).toBe("Successfully created DM's message");
        expect(messageData).toBeDefined();
        expect(messageData.attachments).toBeDefined();
        for (const attachment of messageData.attachments) {
          expect(attachment.url).toContain(`/attachment/${DM?.inbox?.id}/`);
          expect(attachment.thumbnailUrl).toContain(
            `/attachment/${DM?.inbox?.id}/`,
          );
        }
      })
      .expect(200)
      .end(done);
  });
});
