import { RequestHandler } from "express";

const createAuthenticationHandler = ({
  message,
  errMessage,
}: {
  message: string;
  errMessage: string;
}): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message,
        error: {
          message: errMessage,
        },
      });

      return;
    }
    next();
  };
};

export { createAuthenticationHandler };
