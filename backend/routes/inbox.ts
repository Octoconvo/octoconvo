import express from "express";
import * as messageController from "../controllers/message";

const router = express.Router();

router.get("/:inboxid/messages", messageController.messages_get);

export default router;
