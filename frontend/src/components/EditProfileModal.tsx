"use client";

import EditProfileFormWrapper from "@/components/EditProfileFormWrapper";
import { EditProfileModalContext, ActiveModalsContext } from "@/contexts/modal";
import { useContext } from "react";

const EditProfileModal = () => {
  const { editProfileModal } = useContext(EditProfileModalContext);
  const { activeModals, closeModal } = useContext(ActiveModalsContext);

  return (
    <div
      ref={editProfileModal}
      data-testid="edt-prfl-mdl-main"
      className={
        "absolute flex justify-center top-0 left-0 w-[100vw] h-full backdrop-blur-md z-20" +
        (activeModals.length > 0 &&
        activeModals[0]?.current === editProfileModal?.current
          ? ""
          : " hidden")
      }
    >
      <div className="flex flex-col overflow-y-auto items-center bg-black-400 h-full w-min scrollbar p-8">
        <div className="flex w-full justify-end">
          <button
            data-testid="edt-prfl-mdl-cls-btn"
            className="flex justify-center items-center min-w-[48px] min-h-[48px] bg-grey-100 rounded-full hover:bg-grey-200"
            onClick={() => closeModal()}
          >
            <span className="close-icon"></span>
          </button>
        </div>

        <div className="bg-black-400 h-min py-8">
          <EditProfileFormWrapper />
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
