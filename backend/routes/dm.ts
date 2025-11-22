import express from "express";
import * as dmController from "../controllers/dm";

const router = express.Router();

router.get("/direct-messages", dmController.user_DMs_get);

export default router;
