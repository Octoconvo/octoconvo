"use client";

import { useRouter } from "next/navigation";
import { createSignupOnSubmit } from "@/utils/formUtils";
import SignupForm from "./SignupForm";
import { useState } from "react";
import { ValidationError } from "@/types/form";

const SignupFormWrapper = () => {
  const [validationError, setValidationError] = useState<ValidationError[]>([]);
  const router = useRouter();
  const errorHandler = (error: ValidationError[]) => {
    console.log(error);
    setValidationError(error);
  };
  const successHandler = () => router.push("/login");
  const onSubmit = createSignupOnSubmit({ errorHandler, successHandler });

  return (
    <>
      <SignupForm onSubmit={onSubmit} validationError={validationError} />
    </>
  );
};

export default SignupFormWrapper;
