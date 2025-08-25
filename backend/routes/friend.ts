import express from "express";
import * as friendController from "../controllers/friend";

const router = express.Router();

router.get("/friendship-status", friendController.user_friendship_status_get);

router.post("", friendController.friend_add_post);

export default router;
