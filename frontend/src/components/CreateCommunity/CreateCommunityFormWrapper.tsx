"use client";

import CreateCommunityForm from "@/components/CreateCommunity/CreateCommunityForm";
import { useContext, useState } from "react";
import { getFormData, createOnSubmit } from "@/utils/formUtils";
import { CommunityAPI } from "@/types/api";
import {
  CreateCommunityForm as CreateCommunityFormType,
  ValidationError,
} from "@/types/form";
import { useRouter } from "next/navigation";
import { ActiveModalsContext } from "@/contexts/modal";

const EditProfileFormWrapper = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<ValidationError[]>([]);
  const { closeModal } = useContext(ActiveModalsContext);
  const router = useRouter();

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

  const successHandler = (data: CommunityAPI) => {
    // Redirect to the created community and close the community creation modal
    router.replace(`/lobby/communities/${data.id}`);
    closeModal();
  };

  const onSubmit = createOnSubmit<
    CreateCommunityFormType,
    CommunityAPI,
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
