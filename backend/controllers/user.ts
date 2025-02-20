import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { createUser, getUserByUsername } from "../database/prisma/userQueries";
import { NextFunction, Request, Response } from "express";
import { createValidationErrObj } from "../utils/error";
import passport, { AuthenticateCallback } from "passport";
import AuthenticationEmitter from "../events/authentication";

const userValidation = {
  username_signup: body("username", "username is required")
    .trim()
    .isLength({ min: 1 })
    .bail()
    .isLength({ max: 32 })
    .withMessage("Username must not exceed 32 characters")
    .custom(async val => {
      const regex = new RegExp("^[a-zA-Z0-9_]+$");
      const match = regex.test(val);
      if (!match) {
        throw new Error(
          "Username must only contain alphanumeric characters and underscores",
        );
      }
    })
    .escape()
    .custom(async (val: string) => {
      const user = await getUserByUsername(val);

      if (user) {
        throw new Error("Username is already taken");
      }
    }),
  password: body("password", "Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .custom(async (val: string) => {
      const regex = new RegExp(
        "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W_]).{8,}",
      );
      const match = regex.test(val);
      if (!match) {
        throw new Error(
          "Password must contain at least one digit, one lowercase letter, one uppercase letter," +
            "and one special character",
        );
      }
    })
    .escape(),
  username_login: body("username", "username is required")
    .trim()
    .isLength({ min: 1 })
    .bail()
    .isLength({ max: 32 })
    .withMessage("Username must not exceed 32 characters")
    .custom(async val => {
      const regex = new RegExp("^[a-zA-Z0-9_]+$");
      const match = regex.test(val);
      if (!match) {
        throw new Error(
          "Username must only contain alphanumeric characters and underscores",
        );
      }
    })
    .escape(),
};

const user_sign_up_post = [
  userValidation.username_signup,
  userValidation.password,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(
        errors,
        "Failed to create a new account",
      );

      res.status(422).json(obj);
      return;
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
        return;
      }

      const username = req.body.username.toLowerCase();

      const user = await createUser({
        username,
        displayName: username,
        password: hashedPassword,
      });

      res.json({
        message: `Successfully signed up as ${username}`,
        user: {
          id: user.id,
        },
      });
    });
  }),
];

const user_log_in_get = (req: Request, res: Response) => {
  const user = req.user;
  const message = user ? "You are authenticated" : "You are not authenticated";

  res.json({
    user: user ? { id: user.id } : false,
    message,
  });
};

const user_log_in_post = [
  userValidation.username_login,
  userValidation.password,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const obj = createValidationErrObj(errors, "Failed to log in");

      res.status(422).json(obj);
      return;
    }

    const verifyCallBack: AuthenticateCallback = (err, user, info) => {
      if (err) {
        return next(err);
      }

      const messageObj = info as { message: string };

      if (!user) {
        return res.status(401).json({
          message: "Failed to log in",
          error: {
            message: messageObj.message,
          },
        });
      } else {
        const userData = user as Express.User;
        return req.logIn(user, () => {
          AuthenticationEmitter.login({ user, date: new Date(Date.now()) });
          res.json({
            message: "Successfully logged in",
            user: {
              id: userData.id,
            },
          });
        });
      }
    };

    // Authenticate with Passport
    passport.authenticate("local", verifyCallBack)(req, res, next);
  }),
];

// const user_put = [

// ]

export { user_sign_up_post, user_log_in_post, user_log_in_get };
