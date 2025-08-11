import express from "express";
import * as communityController from "../controllers/community";
import * as profileController from "../controllers/profile";

const router = express.Router();

router.get("/communities", communityController.communities_explore_get);

router.get("/profiles", profileController.profiles_explore_get);

export default router;
