import express from "express";
import * as messageController from "../controllers/message";

const router = express.Router();

router.post("", messageController.message_post);

export default router;
