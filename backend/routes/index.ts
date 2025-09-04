import { Request, Response } from "express";
import express from "express";
import * as communityController from "../controllers/community";
import * as notificationController from "../controllers/notification";
import * as friendController from "../controllers/friend";

const router = express.Router();

/* GET home page. */
router.get("/", function (req: Request, res: Response) {
  res.send("index");
});

router.get("/communities", communityController.communities_get);

router.get("/notifications", notificationController.notifications_get);

router.post(
  "/notifications/update-read-status",
  notificationController.notifications_update_read_status_post,
);

router.get("/friends", friendController.user_friends_get);

export default router;
