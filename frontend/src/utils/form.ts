import { SubmitHandler } from "react-hook-form";
import SignupForm from "@/components/SignupForm";
import { ValidationError } from "@/types/form";

const usernameValidation = {
  required: "username is required",
  maxLength: {
    value: 32,
    message: "Username cannot exceed 32 characters",
  },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: "Username must only contain alphanumerics and underscores",
  },
};

const passwordValidation = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must contain at least 8 characters",
  },
  pattern: {
    value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}/,
    message:
      "Password must contain at least one digit" +
      ", one lowercase letter, one uppercase letter, and one special character",
  },
};

const displayNameValidation = {
  required: "Display name is required",
  maxLength: {
    value: 32,
    message: "Display name must not exceed 32 characters",
  },
};

const bioValidation = {
  maxLength: {
    value: 255,
    message: "Bio must not exceed 255 characters",
  },
};

const profileImgMimetype = ["image/png", "image/jpeg"];

const avatarValidation = {
  // eslint-disable-next-line
  validate: (value: any) => {
    if (value.length < 1) {
      return value;
    } else {
      const file = value[0] as File;
      const isValid = profileImgMimetype.includes(file.type);
      return isValid ? value : "Avatar must be either JPEG or PNG";
    }
  },
};

const bannerValidation = {
  // eslint-disable-next-line
  validate: (value: any) => {
    if (value.length < 1) {
      return value;
    } else {
      const file = value[0] as File;
      const isValid = profileImgMimetype.includes(file.type);
      return isValid ? value : "Banner must be either JPEG or PNG";
    }
  },
};

const createSignupOnSubmit = ({
  errorHandler,
  successHandler,
}: {
  errorHandler: (error: ValidationError[]) => void;
  successHandler: () => void;
}): SubmitHandler<SignupForm> => {
  return async (data) => {
    const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    try {
      const signup = await fetch(`${domainURL}/account/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const signupData = await signup.json();
      // Handle errors
      if (signup.status >= 400) {
        console.log(signupData.message);

        // Handle 422 error response
        if (signup.status === 422) {
          errorHandler(signupData.error.validationError);
        }
      } else {
        successHandler();
      }
    } catch (err) {
      console.log("Something went wrong, failed to sign up");

      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };
};

const createOnSubmit =
  <FormType extends object, Data, errorHandlerType>({
    dataKey,
    initialHandler,
    doneHandler,
    errorHandler,
    successHandler,
    path,
    getFormData,
    config,
  }: {
    dataKey: string;
    initialHandler: () => void;
    doneHandler: () => void;
    errorHandler: (status: number, error: errorHandlerType) => void;
    successHandler: (data: Data) => void;
    path: string;
    getFormData: (data: FormType) => BodyInit;
    config: RequestInit;
  }): SubmitHandler<FormType> =>
  async (data: FormType) => {
    const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

    const formData = getFormData(data);

    try {
      initialHandler();

      const response = await fetch(`${domainURL}/${path}`, {
        ...config,
        body: formData,
      });

      const responseData = await response.json();

      // Handle errors
      if (response.status >= 400) {
        if (response.status === 422)
          errorHandler(response.status, responseData.error.validationError);
      }

      if (response.status === 401) {
        errorHandler(response.status, responseData.error.message);
      } else {
        successHandler(responseData[dataKey]);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    } finally {
      doneHandler();
    }
  };

const getFormData = <type>(data: type) => {
  const formData = new FormData();
  for (const key in data) {
    let value;

    if (data[key] instanceof FileList) {
      value = data[key][0] as Blob;
    } else {
      value = data[key] as string;
    }
    formData.append(`${key}`, value);
  }

  return formData;
};

export {
  usernameValidation,
  passwordValidation,
  avatarValidation,
  bannerValidation,
  displayNameValidation,
  bioValidation,
  createSignupOnSubmit,
  createOnSubmit,
  getFormData,
};
