import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import passportConfig from "./config/passportConfig";
import { expr404ErrorHandler, exprErrorHandler } from "./utils/error";
import cors from "cors";

import indexRouter from "./routes/index";
import userRouter from "./routes/user";
import accountRouter from "./routes/account";
import profileRouter from "./routes/profile";

const app = express();
app.use(logger("dev"));
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);
app.use(
  session({
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    secret: process.env.SECRET as string,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
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
app.use("/users", userRouter);
app.use("/account", accountRouter);
app.use("/profile", profileRouter);

app.use(expr404ErrorHandler);
app.use(exprErrorHandler);

module.exports = app;
