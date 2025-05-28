import express from "express";
import * as communityController from "../controllers/community";

const router = express.Router();

router.get("/:communityid", communityController.community_get);

router.post("", communityController.community_post);

export default router;
