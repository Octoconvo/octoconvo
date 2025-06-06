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

type CreateCommunityForm = {
  avatar: File;
  banner: File;
  name: string;
  bio: string;
};

type CommunityMessageForm = {
  attachments: File[];
  content: string;
};

export type {
  SignupForm,
  LoginForm,
  ValidationError,
  EditProfileForm,
  CreateCommunityForm,
  CommunityMessageForm,
};
