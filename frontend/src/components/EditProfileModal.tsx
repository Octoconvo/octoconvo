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
          ? " "
          : " hidden")
      }
    >
      <div className="flex items-center max-h-100dvh m-8">
        <div
          className={
            "flex items-center max-h-[calc(100dvh-4rem)] bg-grey-100" +
            " shadow-[0_16px_var(--brand-1)] rounded-[8px] overflow-hidden"
          }
        >
          <div
            className={
              "flex flex-col item-center rounded-[8px]" +
              " max-h-[calc(100dvh-4rem)] overflow-y-auto scrollbar w-min p-8 bg-grey-100"
            }
          >
            <div className="flex w-full justify-end">
              <button
                data-testid="edt-prfl-mdl-cls-btn"
                className={
                  "flex justify-center items-center min-w-[48px]" +
                  " min-h-[48px] bg-grey-200 rounded-full hover:bg-grey-300"
                }
                onClick={() => closeModal()}
              >
                <span className="close-icon"></span>
              </button>
            </div>
            {activeModals.length > 0 &&
              activeModals[0]?.current === editProfileModal?.current && (
                <div className="h-min py-8">
                  <EditProfileFormWrapper />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
