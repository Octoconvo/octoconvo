type SignupForm = {
  username: string;
  password: string;
};

type LoginForm = {
  username: string;
  password: string;
};

type ValidationError = {
  field: string;
  value: string;
  msg: string;
};

export type { SignupForm, LoginForm, ValidationError };
