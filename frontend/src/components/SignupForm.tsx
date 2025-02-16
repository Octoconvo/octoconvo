"use client";
import InputWrapper from "./InputWrapper";
import ValidationError from "./ValidationError";
import type {
  SignupForm,
  ValidationError as ValidationErrorType,
} from "../../@types/form";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import VisibilityButton from "./VisibilityButton";
import { useState } from "react";
import { usernameValidation, passwordValidation } from "@/utils/form";

const SignupForm = ({
  onSubmit,
  validationError,
}: {
  onSubmit: SubmitHandler<SignupForm>;
  validationError: ValidationErrorType[];
}) => {
  const methods = useForm<SignupForm>();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <InputWrapper>
          <label htmlFor="username">Username</label>
          {errors.username && (
            <div data-testid="rfh-username-err" className="text-invalid">
              {errors.username?.message}
            </div>
          )}
          {validationError && (
            <ValidationError
              validationError={validationError}
              field="username"
            />
          )}
          <input
            data-testid="username"
            id="username"
            autoComplete="username"
            {...register("username", usernameValidation)}
            className="rounded-[8px] box-border py-1 px-2 text-black-300 bg-white-100"
          ></input>
        </InputWrapper>
        <InputWrapper>
          <label htmlFor="password">Password</label>
          {errors.password && (
            <div data-testid="rfh-password-err" className="text-invalid">
              {errors.password?.message}
            </div>
          )}
          <div className="relative flex flex-auto items-center">
            <input
              data-testid="password"
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="password-new"
              {...register("password", passwordValidation)}
              className="rounded-[8px] box-border py-1 px-2 text-black-300 w-full bg-white-100"
            ></input>
            <VisibilityButton
              setIsVisible={setIsPasswordVisible}
              isVisible={isPasswordVisible}
            />
          </div>
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
