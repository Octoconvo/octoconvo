import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passportConfig from "../config/passportConfig";
import { notFoundErrorMiddleware, errorMiddleware } from "../middlewares/error";
import { createServer } from "node:http";
import { createSocketServer } from "../events/socketIO";

//Controllers
import * as userController from "../controllers/user";
import * as profileController from "../controllers/profile";
import * as communityController from "../controllers/community";
import * as messageController from "../controllers/message";
import * as notificationController from "../controllers/notification";
import * as friendController from "../controllers/friend";

const app = express();

app.use(
  session({
    cookie: {
      secure: false,
    },
    secret: "test",
    resave: false,
    saveUninitialized: true,
  }),
);
const httpServer = createServer(app);
createSocketServer(httpServer, app);

app.use(
  session({
    cookie: {
      secure: false,
    },
    secret: "test",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passportConfig.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/account/signup", userController.user_sign_up_post);
app.get("/account/login", userController.user_log_in_get);
app.post("/account/login", userController.user_log_in_post);
app.post("/account/logout", userController.user_log_out_post);

app.get("/profile/:id", profileController.user_profile_get);
app.post("/profile/:id", profileController.user_profile_post);

app.get("/communities", communityController.communities_get);
app.get("/community/:communityid", communityController.community_get);
app.post("/community", communityController.community_post);
app.get(
  "/community/:communityid/participation-status",
  communityController.community_participation_status_get,
);
app.post(
  "/community/:communityid/join",
  communityController.community_join_post,
);
app.post(
  "/community/:communityid/request",
  communityController.community_request_POST,
);

app.post("/message", messageController.message_post);
app.get("/inbox/:inboxid/messages", messageController.messages_get);

app.get("/explore/communities", communityController.communities_explore_get);
app.get("/explore/profiles", profileController.profiles_explore_get);

app.get("/notifications", notificationController.notifications_get);
app.get(
  "/notification/unread-count",
  notificationController.unread_notification_count_get,
);
app.post(
  "/notifications/update-read-status",
  notificationController.notifications_update_read_status_post,
);

app.get(
  "/friend/friendship-status",
  friendController.user_friendship_status_get,
);

app.post("/friend", friendController.friend_add_post);

app.use(notFoundErrorMiddleware);
app.use(errorMiddleware);

export default app;
