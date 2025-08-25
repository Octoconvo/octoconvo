import {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { createValidationErrObj } from "../utils/error";

// eslint-disable-next-line
const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
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

const notFoundErrorMiddleware = (
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
  errorMiddleware,
  notFoundErrorMiddleware,
  createValidationErrorMiddleware,
};
