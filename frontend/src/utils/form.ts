import { SubmitHandler } from "react-hook-form";
import SignupForm from "@/components/SignupForm";
import { ValidationError } from "../../@types/form";

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
    initialHandler,
    doneHandler,
    errorHandler,
    successHandler,
    path,
    getFormData,
    config,
  }: {
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
        successHandler(responseData.user);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    } finally {
      doneHandler();
    }
  };

export {
  usernameValidation,
  passwordValidation,
  createSignupOnSubmit,
  createOnSubmit,
};
