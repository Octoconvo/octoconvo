import express from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./database/prisma/client";
import passportConfig from "./config/passportConfig";
import { notFoundErrorMiddleware, errorMiddleware } from "./middlewares/error";
import cors from "cors";

import indexRouter from "./routes/index";
import userRouter from "./routes/user";
import accountRouter from "./routes/account";
import profileRouter from "./routes/profile";
import communityRouter from "./routes/community";
import messageRouter from "./routes/message";
import inboxRouter from "./routes/inbox";
import exploreRouter from "./routes/explore";
import notificationRouter from "./routes/notification";
import friendRouter from "./routes/friend";
import dmRouter from "./routes/dm";

const NODE_ENV = process.env.NODE_ENV;
const isDev = NODE_ENV?.toLowerCase() == "development";

const logger = pinoHttp(
  isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorarize: true,
          },
        },
      }
    : {},
);
const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);
app.use(logger);
app.use(
  session({
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    secret: process.env.SECRET as string,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // 2 minutes,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);
app.use(passportConfig.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/explore", exploreRouter);
app.use("/users", userRouter);
app.use("/account", accountRouter);
app.use("/profile", profileRouter);
app.use("/community", communityRouter);
app.use("/message", messageRouter);
app.use("/inbox", inboxRouter);
app.use("/notification", notificationRouter);
app.use("/friend", friendRouter);
app.use("/direct-message", dmRouter);

app.use(notFoundErrorMiddleware);
app.use(errorMiddleware);

module.exports = app;
