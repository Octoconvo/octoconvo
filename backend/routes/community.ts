import express from "express";
import * as communityController from "../controllers/community";

const router = express.Router();

router.get("/:communityid", communityController.community_get);

router.get(
  "/:communityid/participation-status",
  communityController.community_participation_status_get,
);

router.post(":/communityid/join", communityController.community_join_post);

router.post("", communityController.community_post);

export default router;
