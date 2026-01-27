import express from "express";
import * as dmController from "../controllers/dm";
import * as messageController from "../controllers/message";

const router = express.Router();

router.get("/:directmessageid", dmController.DM_get);

router.get("/:directmessageid/messages", messageController.dm_messages_get);

router.post("/:directmessageid/message", messageController.dm_message_post);

export default router;
