import { ErrorRequestHandler } from "express";

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

export { exprErrorHandler };
