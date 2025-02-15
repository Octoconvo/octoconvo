import { SubmitHandler } from "react-hook-form";
import SignupForm from "@/components/SignupForm";
import { ValidationError } from "../../@types/form";

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
      const login = await fetch(`${domainURL}/account/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const loginData = await login.json();

      // Handle errors
      if (login.status >= 400) {
        console.log(loginData.message);

        // Handle 422 error response
        if (login.status === 422) {
          errorHandler(loginData.error.validationError);
        }
      } else {
        successHandler();
      }
    } catch (err) {
      console.log("Something went wrong, failed to sign up");
      if (err instanceof TypeError) console.log(err.message);
    }
  };
};

export { createSignupOnSubmit };
