import { Result } from "express-validator";

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

const logErrorMessage = (
  // eslint-disable-next-line
  error: any,
) => {
  if (error instanceof Error) {
    console.log(error.message);
  }
};

export { createValidationErrObj, logErrorMessage };
