import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

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

const createNotFoundErrorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const err = createHttpError(404);

  next(err);
};

export { errorMiddleware, createNotFoundErrorMiddleware };
