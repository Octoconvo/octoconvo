"use client";

import CreateCommunityForm from "@/components/CreateCommunity/CreateCommunityForm";
import { useState } from "react";
import { getFormData, createOnSubmit } from "@/utils/form";
import { CommunityResponsePOST } from "@/types/response";
import {
  CreateCommunityForm as CreateCommunityFormType,
  ValidationError,
} from "@/types/form";

const EditProfileFormWrapper = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<ValidationError[]>([]);

  const initialHandler = () => {
    setIsSubmitting(true);
  };

  const doneHandler = () => {
    setIsSubmitting(false);
  };

  type ErrorHandlerType = ValidationError[] | string;

  const errorHandler = (status: number, error: ErrorHandlerType) => {
    console.log(error);
    if (status === 422) {
      setValidationError(error as ValidationError[]);
    }
  };

  const successHandler = (data: CommunityResponsePOST) => {
    console.log(data);
  };

  const onSubmit = createOnSubmit<
    CreateCommunityFormType,
    CommunityResponsePOST,
    ErrorHandlerType
  >({
    dataKey: "community",
    initialHandler,
    doneHandler,
    errorHandler,
    successHandler,
    path: `community`,
    getFormData,
    config: {
      mode: "cors",
      method: "POST",
      credentials: "include",
    },
  });

  return (
    <>
      <CreateCommunityForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        validationError={validationError}
        resetError={() => {
          setValidationError([]);
        }}
      ></CreateCommunityForm>
    </>
  );
};

export default EditProfileFormWrapper;
