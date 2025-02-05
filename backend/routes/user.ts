import { Request, Response, NextFunction } from "express";
import express from "express";
const router = express.Router();

/* GET users listing. */
router.get("/", function (req: Request, res: Response, nex: NextFunction) {
  res.send("respond with a resource");
});

export default router;
