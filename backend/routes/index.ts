import { Request, Response } from "express";
import express from "express";
import * as communityController from "../controllers/community";
const router = express.Router();

/* GET home page. */
router.get("/", function (req: Request, res: Response) {
  res.send("index");
});

router.get("/communities", communityController.communities_get);

export default router;
