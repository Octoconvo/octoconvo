"use client";

import { EditProfileModalContext } from "@/contexts/modal";
import { useRef } from "react";
import EditProfileModal from "@/components/EditProfileModal";

const EditProfileModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const editProfileModalRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <EditProfileModalContext.Provider
        value={{ editProfileModal: editProfileModalRef }}
      >
        <EditProfileModal />
        {children}
      </EditProfileModalContext.Provider>
    </>
  );
};

export default EditProfileModalProvider;
