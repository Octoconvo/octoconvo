"use client";

import { useState, useContext } from "react";
import { UserProfileContext } from "@/contexts/user";
import {
  ValidationError,
  EditProfileForm as EditProfileFormType,
} from "@/types/form";
import { User, UserProfile } from "@/types/user";
import EditProfileForm from "@/components/EditProfileForm";
import { createOnSubmit, getFormData } from "@/utils/form";

const EditProfileFormWrapper = () => {
  const { userProfile } = useContext(UserProfileContext);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialHandler = () => {
    setIsSubmitting(true);
  };

  const doneHandler = () => {
    setIsSubmitting(false);
  };

  type ErrorHandlerType = ValidationError[] | string;

  const errorHandler = (status: number, error: ErrorHandlerType) => {
    console.log(error);
  };

  const successHandler = (data: User) => {
    console.log(data);
  };

  const onSubmit = createOnSubmit<
    EditProfileFormType,
    UserProfile,
    ErrorHandlerType
  >({
    dataKey: "userProfile",
    initialHandler,
    doneHandler,
    errorHandler,
    successHandler,
    path: `profile/${userProfile?.id}`,
    getFormData,
    config: {
      mode: "cors",
      method: "POST",
      credentials: "include",
    },
  });

  return (
    <>
      <EditProfileForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      ></EditProfileForm>
    </>
  );
};

export default EditProfileFormWrapper;
