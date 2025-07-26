import express from "express";
import * as notificationController from "../controllers/notification";

const router = express.Router();

router.get(
  "/unread-count",
  notificationController.unread_notification_count_get,
);

export default router;
