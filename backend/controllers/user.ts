import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { createUser, getUserByUsername } from "../database/prisma/userQueries";
import { NextFunction, Request, Response } from "express";
import { createValidationErrObj } from "../utils/error";

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
    .custom(async val => {
      const user = await getUserByUsername(val);

      if (user) {
        throw new Error("Username is already taken");
      }
    }),
  password: body("password", "Password is required")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
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

export { user_sign_up_post };
