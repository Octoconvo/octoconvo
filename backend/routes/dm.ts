import express from "express";
import * as dmController from "../controllers/dm";

const router = express.Router();

router.get("/:directmessageid", dmController.DM_get);

export default router;
