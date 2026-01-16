import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { createAuthenticationMiddleware } from "../utils/authentication";
import { createValidationErrObj } from "../utils/error";
import { body, check, param, query, validationResult } from "express-validator";
import { getInboxById } from "../database/prisma/inboxQueries";
import { createMessage, getMessages } from "../database/prisma/messageQueries";
import sharp from "sharp";
import multer from "multer";
import { getPublicURL, uploadFile } from "../database/supabase/supabaseQueries";
import { getCommunityByIdAndParticipant } from "../database/prisma/communityQueries";
import { convertFileName } from "../utils/file";
import { isUUID, isISOString } from "../utils/validation";
import { Inbox, Message } from "@prisma/client";
import {
  getDirectMessageInboxById,
  hasDMAccess,
} from "../database/prisma/dmQueries";
import { deconstructMessageCursor, getMsgCursors } from "../utils/cursor";

// Process file forms
const storage = multer.memoryStorage();
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1000 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(new Error("INVALID_MIMETYPE"));
    }

    cb(null, true);
  },
});

const messageValidation = {
  content: body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message is required")
    .isLength({ max: 2048 })
    .withMessage("Message must not exceed 2048 characters")
    .escape(),
  inboxId: body("inboxid")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Inbox id is required")
    .bail()
    .custom(val => {
      const uuidRegex = new RegExp(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
      );

      if (!uuidRegex.test(val)) {
        throw new Error("Invalid inbox id");
      }

      return true;
    }),
  inboxIdParam: param("inboxid")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Inbox id is required")
    .bail()
    .custom(val => {
      const uuidRegex = new RegExp(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
      );

      if (!uuidRegex.test(val)) {
        throw new Error("Invalid inbox id");
      }

      return true;
    }),
  directMessageIdParam: param("directmessageid")
    .trim()
    .custom((val: string): boolean => {
      if (!isUUID(val)) {
        console.log({ val });
        throw new Error("DM id is invalid");
      }

      return true;
    }),
  attachments: check("attachments").custom((val, { req }) => {
    const files = req?.files;
    let totalSize = 0;

    if (files) {
      files.map((file: Express.Multer.File) => {
        totalSize += file.size;
      });

      if (totalSize > 1024 * 10000) {
        throw new Error("Message attachments total size must not exceed 10 MB");
      }
    }

    return true;
  }),
  limit: query("limit")
    .optional({ values: "falsy" })
    .bail()
    .isInt({
      min: 1,
      max: 100,
      allow_leading_zeroes: false,
    })
    .withMessage("Limit must be an integer between 1 and 100"),
  cursor: query("cursor")
    .trim()
    .optional({
      values: "falsy",
    })
    .bail()
    .custom(
      // eslint-disable-next-line
      (value, { req }) => {
        const cursor = value;
        const id = cursor ? cursor.split("_")[0] : null;
        const createdAt = cursor ? cursor.split("_")[1] : null;

        // Validate cursor createdAt and id
        if (!(isISOString(createdAt) && isUUID(id))) {
          throw new Error("Cursor value is invalid");
        }

        return true;
      },
    ),
  direction: query("direction")
    .trim()
    .optional({
      values: "falsy",
    })
    .bail()
    .custom(
      // eslint-disable-next-line
      (value, { req }) => {
        // Check if the value is either forward or backward
        const regex = new RegExp(/^(forward)$|^(backward)$/);

        if (!regex.test(value)) {
          throw new Error(
            "Cursor direction must be either backward or forward",
          );
        }

        return true;
      },
    ),
};

const messagePOSTAuthentication = createAuthenticationMiddleware({
  message: "Failed to create message",
  errMessage: "You are not authenticated",
});

const message_post = [
  messagePOSTAuthentication,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("attachments", 10)(req, res, function (err) {
      // Handle file validation
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({
            message: "Failed to create message",
            error: {
              validationError: [
                {
                  field: "attachments",
                  msg: "Individual file in attachments must not exceed 5 MB",
                },
              ],
            },
          });
        }

        return;
      } else if (err) {
        if (err.message === "INVALID_MIMETYPE") {
          res.status(422).json({
            message: "Failed to create message",
            error: {
              validationError: [
                {
                  field: "attachments",
                  msg: "Message attachments can only be in jpeg, png, or gif format",
                },
              ],
            },
          });

          return;
        } else {
          next(err);
        }
      }

      next();
    });
  },
  messageValidation.content,
  messageValidation.inboxId,
  messageValidation.attachments,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to create message");

      res.status(422).json(obj);
      return;
    }

    const user = req.user as Express.User;
    const inboxId = req.body.inboxid;
    const content = req.body.content;
    type Attachments = {
      type: "IMAGE";
      subtype: "JPEG" | "PNG" | "GIF";
      height: number;
      width: number;
      size: number;
      url: string;
      thumbnailUrl: string;
    };
    const attachments: Attachments[] = [];

    // Check if inbox exists
    const inbox = await getInboxById(inboxId);

    // send 404 error if the inbox doesn't exist
    if (inbox === null) {
      res.status(404).json({
        message: "Failed to create message",
        error: {
          message: "The recipient's inbox doesn't exist",
        },
      });

      return;
    }

    if (inbox.inboxType === "COMMUNITY") {
      const community = await getCommunityByIdAndParticipant({
        communityId: inbox.communityId as string,
        participantId: user.id as string,
      });

      if (community === null) {
        res.status(403).json({
          message: "Failed to create message",
          error: {
            message: "You are not a member of this community",
          },
        });

        return;
      }
    }

    if (req.files !== null && req.files !== undefined) {
      // Handle files upload
      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        const handleFileAttachment = async (file: Express.Multer.File) => {
          // Compress image
          const fileCopy = convertFileName(file);
          const thumbnailCopy = convertFileName(file);

          type ValidMimetype = "jpeg" | "png" | "gif";
          const type: ValidMimetype = fileCopy.mimetype.split(
            "/",
          )[1] as ValidMimetype;

          const fileBuffer = await sharp(file.buffer)[type]().toBuffer();
          const metadata = await sharp(file.buffer).metadata();
          let thumbnailBuffer;

          if (metadata?.height || 0 > (metadata?.width || 0)) {
            // prettier-ignore
            thumbnailBuffer = await sharp(file.buffer)[type]({ quality: 70 })
              .resize({ height: 720, fit: "cover" })
              .toBuffer();
          } else {
            // prettier-ignore
            thumbnailBuffer = await sharp(file.buffer)[type]({ quality: 70 })
              .resize({ width: 720, fit: "cover" })
              .toBuffer();
          }

          fileCopy.buffer = fileBuffer;
          thumbnailCopy.buffer = thumbnailBuffer;

          const uploadFileAndGetUrl = async (file: Express.Multer.File) => {
            const fileData = await uploadFile({
              file: file,
              bucketName: "attachment",
              folder: inboxId,
            });

            const fileUrl = getPublicURL({
              path: fileData.path,
              bucketName: "attachment",
            });

            return fileUrl;
          };

          const fileUrl = await uploadFileAndGetUrl(fileCopy);
          const thumbnailUrl = await uploadFileAndGetUrl(thumbnailCopy);

          if (fileUrl && thumbnailUrl) {
            const type = file.mimetype.split("/")[0].toUpperCase() as "IMAGE";
            const subtype = file.mimetype.split("/")[1].toUpperCase() as
              | "JPEG"
              | "PNG"
              | "GIF";

            const attachment = {
              type: type,
              subtype: subtype,
              width: metadata.width as number,
              height: metadata.height as number,
              size: file.size,
              url: fileUrl.publicUrl,
              thumbnailUrl: thumbnailUrl.publicUrl,
            };
            attachments.push(attachment);
          }
        };

        await handleFileAttachment(file);
      }
    }

    const message = await createMessage({
      authorId: user.id,
      inboxId,
      content,
      attachments,
    });

    if (inbox.inboxType === "COMMUNITY") {
      req.app
        .get("io")
        .to(`community:${inbox.communityId}`)
        .emit("messagecreated", message);
    }

    res.json({
      message: "Successfully created message",
      messageData: message,
    });
  }),
];

const messagesGETAuthentication = createAuthenticationMiddleware({
  message: "Failed to fetch messages",
  errMessage: "You are not authenticated",
});

const messages_get = [
  messagesGETAuthentication,
  messageValidation.inboxIdParam,
  messageValidation.limit,
  messageValidation.cursor,
  messageValidation.direction,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const inboxId = req.params.inboxid;
    const user = req.user as Express.User;

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, `Failed to fetch messages`);

      res.status(422).json(obj);
      return;
    }

    // Check if inbox exists
    const inbox = await getInboxById(inboxId);

    // send 404 error if the inbox doesn't exist
    if (inbox === null) {
      res.status(404).json({
        message: `Failed to fetch messages`,
        error: {
          message: "The inbox doesn't exist",
        },
      });

      return;
    }

    // Check authorization
    if (inbox.inboxType === "COMMUNITY") {
      const community = await getCommunityByIdAndParticipant({
        communityId: inbox.communityId as string,
        participantId: user.id as string,
      });

      if (community === null) {
        res.status(403).json({
          message: `Failed to fetch messages`,
          error: {
            message: "You are not a member of this community",
          },
        });

        return;
      }
    }

    const limit = req.query.limit ? Number(req.query.limit) : 100;
    type Direction = "forward" | "backward";
    const direction = req.query.direction
      ? (req.query.direction as Direction)
      : "backward";
    // Get id and timestamp from cursor
    const cursor =
      req.query.cursor && typeof req.query.cursor === "string"
        ? {
            id: req.query.cursor.split("_")[0],
            createdAt: req.query.cursor.split("_")[1],
          }
        : null;

    const messages = await getMessages({ cursor, inboxId, limit, direction });

    // Capture the first message id and createAt fields for the next cursor
    const firstMessage = messages.length ? messages[0] : null;
    const firstMsgCursor = firstMessage
      ? `${firstMessage.id}_${new Date(firstMessage.createdAt).toISOString()}`
      : null;

    // Capture the last message id and createAt fields for the previous cursor
    const lastMessage = messages.length ? messages[messages.length - 1] : null;
    const lastMsgCursor = lastMessage
      ? `${lastMessage.id}_${new Date(lastMessage.createdAt).toISOString()}`
      : null;

    // Get the oldest message as the previous cursor
    let prevCursor = direction
      ? direction === "backward"
        ? lastMsgCursor
        : firstMsgCursor
      : firstMsgCursor;

    // Get the latest message as the next cursor
    let nextCursor = direction
      ? direction === "backward"
        ? firstMsgCursor
        : lastMsgCursor
      : lastMsgCursor;

    // Change cursor to null when the messages length less than limit
    if (messages.length < limit) {
      if (direction === "backward") {
        prevCursor = null;
      }

      if (direction === "forward") {
        nextCursor = null;
      }
    }

    let sortedMessages: Message[] = [];

    // Sort backward direction to show the latesr message last
    if (direction === "backward") {
      for (let i = 0; i < messages.length; i++) {
        sortedMessages.unshift(messages[i]);
      }
    } else {
      // No need to sort the messages
      // The forward direction already sorted to show the latest message last
      sortedMessages = messages;
    }

    res.json({
      message: `Successfully fetched messages from inbox ${inboxId}`,
      prevCursor: prevCursor,
      nextCursor: nextCursor,
      messagesData: sortedMessages,
    });
  }),
];

const dm_messages_get = [
  messagesGETAuthentication,
  messageValidation.directMessageIdParam,
  messageValidation.limit,
  messageValidation.cursor,
  messageValidation.direction,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const DMId: string = req.params.directmessageid;
    const user = req.user as Express.User;

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, `Failed to fetch messages`);

      console.log({ error: obj.error.validationError[0] });
      res.status(422).json(obj);
      return;
    }

    const inbox: Inbox | null = await getDirectMessageInboxById(DMId);

    if (inbox === null) {
      res.status(404).json({
        message: `Failed to fetch messages`,
        error: {
          message: "DM doesn't exist",
        },
      });

      return;
    }

    // Check authorisation
    const isAuthorised: boolean = await hasDMAccess({
      directMessageId: inbox.directMessageId as string,
      userId: user.id as string,
    });

    if (!isAuthorised) {
      res.status(403).json({
        message: `Failed to fetch messages`,
        error: {
          message: "You are not authorised to access this DM",
        },
      });

      return;
    }

    const limit = req.query.limit ? Number(req.query.limit) : 100;

    type Direction = "forward" | "backward";
    const direction = (req.query.direction as Direction) || "backward";
    const cursor =
      req.query.cursor && typeof req.query.cursor === "string"
        ? deconstructMessageCursor(req.query.cursor)
        : null;

    const messages = await getMessages({
      cursor,
      inboxId: inbox.id,
      limit,
      direction,
    });

    const { prevCursor, nextCursor } = getMsgCursors(messages);

    res.json({
      message: `Successfully fetched messages`,
      prevCursor:
        messages.length < limit && direction === "backward" ? null : prevCursor,
      nextCursor:
        messages.length < limit && direction === "forward" ? null : nextCursor,
      messagesData: messages,
    });
  }),
];

export { message_post, messages_get, dm_messages_get };
