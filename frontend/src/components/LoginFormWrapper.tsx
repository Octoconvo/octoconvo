"use client";

import { useRouter } from "next/navigation";
import { createOnSubmit } from "@/utils/form";
import LoginForm from "./LoginForm";
import { useContext, useEffect, useState } from "react";
import { LoginForm as LoginFormType, ValidationError } from "../../@types/form";
import { UserContext } from "@/contexts/user";
import { User } from "../../@types/user";

const LoginFormWrapper = () => {
  const { user, setUser } = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<ValidationError[]>([]);
  const router = useRouter();
  const [unauthorizedError, setUnauthorizedError] = useState<string>("");

  const initialHandler = () => {
    setIsSubmitting(true);
  };

  const doneHandler = () => {
    setIsSubmitting(false);
  };

  type ErrorHandlerType = ValidationError[] | string;

  const errorHandler = (status: number, error: ValidationError[] | string) => {
    console.log(error);

    if (status === 422) {
      setValidationError(error as ValidationError[]);
    }

    if (status === 401) {
      setUnauthorizedError(error as string);
    }
  };

  const successHandler = (data: User) => {
    setUser(data);
    router.push("/login");
  };

  const getFormData = <LoginFormType,>(data: LoginFormType) => {
    const formData = new URLSearchParams();
    for (const key in data) {
      formData.append(`${key}`, data[key] as string);
    }

    return formData;
  };

  useEffect(() => {
    if (user !== null && user) router.push("/lobby");
  }, [user, router]);

  const onSubmit = createOnSubmit<LoginFormType, User, ErrorHandlerType>({
    initialHandler,
    doneHandler,
    errorHandler,
    successHandler,
    path: "account/login",
    getFormData,
    config: {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    },
  });

  return (
    <>
      <LoginForm
        onSubmit={onSubmit}
        validationError={validationError}
        unauthorizedError={unauthorizedError}
        isSubmitting={isSubmitting}
        resetError={() => {
          setValidationError([]);
          setUnauthorizedError("");
        }}
      />
    </>
  );
};

export default LoginFormWrapper;
