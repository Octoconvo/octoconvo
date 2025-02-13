import express from "express";
import * as userController from "../controllers/user";

const router = express.Router();

router.post("/signup", userController.user_sign_up_post);

export default router;
