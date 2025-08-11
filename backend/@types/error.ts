type ValidationError = {
  field: string;
  value: string;
  msg: string;
};

type ErrorResponse = {
  message?: string;
  validationError?: ValidationError[];
};

export type { ValidationError, ErrorResponse };
