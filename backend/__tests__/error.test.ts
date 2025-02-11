import { Request, Response, NextFunction } from "express";
import express from "express";
import { exprErrorHandler } from "../utils/error";
import request from "supertest";
import createHttpError from "http-errors";

const app = express();
// pass no message error
app.use("/no-msg", (req: Request, res: Response, next: NextFunction) => {
  const error = new Error();
  next(error);
});
// pass error with status
app.use("/:status", (req: Request, res: Response, next: NextFunction) => {
  const status = Number(req.params.status);
  const error = createHttpError(status);
  next(error);
});
app.use(exprErrorHandler);

describe("Test exprErrorHandler middleware", () => {
  const setProcessEnv = (val: string) => {
    jest.resetModules();
    process.env = {
      NODE_ENV: val,
    };
  };

  test("Check json response 404 error on development", done => {
    request(app)
      .get("/404")
      .expect("Content-Type", /json/)
      .expect({
        error: {
          message: "Not Found",
        },
      })
      .expect(404, done);
  });

  test("Check json response 500 error on development", done => {
    request(app)
      .get("/500")
      .expect("Content-Type", /json/)
      .expect({
        error: {
          message: "Internal Server Error",
        },
      })
      .expect(500, done);
  });

  test("Check json response 500 without error messsage on development", done => {
    request(app)
      .get("/no-msg")
      .expect("Content-Type", /json/)
      .expect({
        error: {
          message: "Server Error:unknown",
        },
      })
      .expect(500, done);
  });

  test("Check json response 404 error on production", done => {
    setProcessEnv("production");
    request(app)
      .get("/404")
      .expect("Content-Type", /json/)
      .expect({
        error: {
          message: "Not Found",
        },
      })
      .expect(404, done);
  });

  test("Check json response 500 error on production", done => {
    setProcessEnv("production");
    request(app)
      .get("/500")
      .expect("Content-Type", /json/)
      .expect({
        error: {
          message: "Server Error",
        },
      })
      .expect(500, done);
  });
});
