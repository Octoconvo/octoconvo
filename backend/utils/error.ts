import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { Result, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { RequestHandler } from "express";

// eslint-disable-next-line
const exprErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Send error message
  const message = err.message || "Server Error:unknown";
  res.status(err.status || 500);
  res.json({
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? err.status >= 500
            ? "Server Error"
            : message
          : message,
    },
  });
};

const createValidationErrObj = (err: Result, message: string) => {
  const errorList = err
    .array()
    .map((err: { path: string; value: string; msg: string }) => {
      return { field: err.path, value: err.value, msg: err.msg };
    });

  return {
    message,
    error: {
      validationError: errorList,
    },
  };
};

const expr404ErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const err = createHttpError(404);

  next(err);
};

const createValidationErrorMiddleware = ({
  message,
}: {
  message: string;
}): RequestHandler => {
  return (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationError = createValidationErrObj(errors, message);

      res.status(422).json(validationError);
      return;
    }

    next();
  };
};

export {
  exprErrorHandler,
  createValidationErrObj,
  expr404ErrorHandler,
  createValidationErrorMiddleware,
};
