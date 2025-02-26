import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { getUserProfileById } from "../database/prisma/profileQueries";

const user_profile_get = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  const userProfile = await getUserProfileById(id);

  if (!userProfile) {
    res.status(404).json({
      message: "Failed to retrieve user profile",
      error: {
        message: "User profile doesn't exist",
      },
    });
    return;
  }

  res.json({
    message: "Succesfully retrieved user profile",
    userProfile,
  });
});

export { user_profile_get };
