import express from "express";
import * as dmController from "../controllers/dm";
import * as messageController from "../controllers/message";

const router = express.Router();

router.get("/:directmessageid", dmController.DM_get);

router.get("/:directmessageid/messages", messageController.dm_messages_get);

export default router;
