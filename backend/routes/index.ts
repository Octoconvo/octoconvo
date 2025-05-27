import { Request, Response } from "express";
import express from "express";
import * as communityController from "../controllers/community";
import * as messageController from "../controllers/message";
const router = express.Router();

/* GET home page. */
router.get("/", function (req: Request, res: Response) {
  res.send("index");
});

router.get("/communities", communityController.communities_get);

router.get("/messages", messageController.messages_get);

export default router;
