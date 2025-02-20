import express from "express";
import * as userController from "../controllers/user";

const router = express.Router();

router.post("/signup", userController.user_sign_up_post);

router.get("/login", userController.user_log_in_get);

router.post("/login", userController.user_log_in_post);

router.post("/logout", userController.user_log_out_post);

export default router;
