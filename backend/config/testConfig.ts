import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passportConfig from "../config/passportConfig";
import * as userController from "../controllers/user";
import * as profileController from "../controllers/profile";
import { expr404ErrorHandler, exprErrorHandler } from "../utils/error";
import { createServer } from "node:http";
import { createSocketServer } from "../events/socketIO";
import * as communityController from "../controllers/community";

const app = express();
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

app.post("/community", communityController.community_post);

app.use(expr404ErrorHandler);
app.use(exprErrorHandler);

export default app;
