"use client";

import { useRouter } from "next/navigation";
import { createOnSubmit } from "@/utils/form";
import LoginForm from "./LoginForm";
import { useState } from "react";
import { LoginForm as LoginFormType, ValidationError } from "../../@types/form";

const LoginFormWrapper = () => {
  const [validationError, setValidationError] = useState<ValidationError[]>([]);
  const router = useRouter();
  const errorHandler = (error: ValidationError[]) => {
    console.log(error);
    setValidationError(error);
  };
  const successHandler = () => router.push("/login");

  const getFormData = <LoginFormType,>(data: LoginFormType) => {
    const formData = new URLSearchParams();
    for (const key in data) {
      formData.append(`${key}`, data[key] as string);
    }

    return formData;
  };

  const onSubmit = createOnSubmit<LoginFormType>({
    errorHandler,
    successHandler,
    path: "account/login",
    getFormData,
    config: {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  });

  return (
    <>
      <LoginForm onSubmit={onSubmit} validationError={validationError} />
    </>
  );
};

export default LoginFormWrapper;
