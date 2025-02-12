import { ErrorRequestHandler } from "express";
import { Result } from "express-validator";

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

export { exprErrorHandler, createValidationErrObj };
