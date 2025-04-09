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

type EditProfileForm = {
  avatar: File;
  banner: File;
  displayname: string;
  bio: string;
};

export type { SignupForm, LoginForm, ValidationError, EditProfileForm };
