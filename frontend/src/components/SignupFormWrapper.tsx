"use client";

import { useRouter } from "next/navigation";
import { createSignupOnSubmit } from "@/utils/form";
import SignupForm from "./SignupForm";

const SignupFormWrapper = () => {
  const router = useRouter();
  const errorHandler = () => console.log("error");
  const successHandler = () => router.push("/login");
  const onSubmit = createSignupOnSubmit({ errorHandler, successHandler });

  return (
    <>
      <SignupForm onSubmit={onSubmit} />
    </>
  );
};

export default SignupFormWrapper;
