import express from "express";
import * as communityController from "../controllers/community";

const router = express.Router();

router.get("/communities", communityController.communities_explore_get);

export default router;
