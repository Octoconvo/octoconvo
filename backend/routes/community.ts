import express from "express";
import * as communityController from "../controllers/community";

const router = express.Router();

router.post("", communityController.community_post);

export default router;
