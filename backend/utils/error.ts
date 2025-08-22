import { Result, validationResult } from "express-validator";
import { RequestHandler } from "express";

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

export { createValidationErrObj, createValidationErrorMiddleware };
