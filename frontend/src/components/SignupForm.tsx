"use client";
import InputWrapper from "./InputWrapper";
import type { SignupForm } from "../../@types/form";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const SignupForm = () => {
  const methods = useForm<SignupForm>();
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<SignupForm> = async (data) => {
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
        console.error(loginData.message);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.log("Something went wrong, failed to sign up");
      if (err instanceof TypeError) console.log(err.message);
    }
  };

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
      message: "Password must be atleast 8 characters long",
    },
    pattern: {
      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}/,
      message:
        "Password must be contain at least one digit," +
        "one lowercase letter, one uppercase letter, and one special character",
    },
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <InputWrapper>
          <label htmlFor="username">Username</label>
          {errors.username && (
            <div className="text-invalid">{errors.username?.message}</div>
          )}
          <input
            data-testid="username"
            id="username"
            {...register("username", usernameValidation)}
            className="rounded-[8px] box-border py-1 px-2 text-black-300"
          ></input>
        </InputWrapper>
        <InputWrapper>
          <label htmlFor="password">Password</label>
          {errors.password && (
            <div className="text-invalid">{errors.password?.message}</div>
          )}
          <input
            data-testid="password"
            id="password"
            type="password"
            {...register("password", passwordValidation)}
            className="rounded-[8px] box-border py-1 px-2 text-black-300"
          ></input>
        </InputWrapper>

        <button
          className={
            "text-h6 bg-brand-1 rounded-[8px] box-border py-1 px-2 " +
            "hover:bg-gr-1-d45 transition-all"
          }
        >
          Sign up
        </button>
      </form>
    </FormProvider>
  );
};

export default SignupForm;
