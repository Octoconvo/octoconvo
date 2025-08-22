import express from "express";
import * as friendController from "../controllers/friend";

const router = express.Router();

router.get("/friendship-status", friendController.user_friendship_status_get);

export default router;
