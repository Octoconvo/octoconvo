import express from "express";
import * as profileController from "../controllers/profile";

const router = express.Router();

router.get("/:id", profileController.user_profile_get);

router.post("/:id", profileController.user_profile_post);

export default router;
