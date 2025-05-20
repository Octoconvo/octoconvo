import request, { Response } from "supertest";
import app from "../../config/testConfig";
import { login } from "../../utils/testUtils";
import prisma from "../../database/prisma/client";
import { console } from "node:inspector";
import { Community, Inbox } from "@prisma/client";
import { deleteAllMessageByContent } from "../../database/prisma/messageQueries";

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
});
