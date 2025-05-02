"use client";

import {
  ActiveModalsContext,
  CreateCommunityModalContext,
} from "@/contexts/modal";
import { useContext } from "react";
import CreateCommunityFormWrapper from "@/components/CreateCommunity/CreateCommunityFormWrapper";

const EditProfileModal = () => {
  const { createCommunityModal } = useContext(CreateCommunityModalContext);
  const { activeModals, closeModal } = useContext(ActiveModalsContext);

  return (
    <div
      ref={createCommunityModal}
      data-testid="crt-cmmnty-modal-main"
      className={
        "absolute flex justify-center top-0 left-0 w-[100vw] h-full" +
        " backdrop-blur-md z-20" +
        (activeModals.length > 0 &&
        activeModals[0]?.current === createCommunityModal?.current
          ? ""
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
                data-testid="crt-cmmnty-mdl-cls-btn"
                className={
                  "flex justify-center hover:bg-grey-300 items-center" +
                  " min-w-[48px] min-h-[48px] bg-grey-200 rounded-full"
                }
                onClick={() => {
                  closeModal();
                }}
              >
                <span className="close-icon"></span>
              </button>
            </div>
            {activeModals.length > 0 &&
              activeModals[0]?.current === createCommunityModal?.current && (
                <>
                  <h2 className="text-h5 font-bold text-center">
                    Create New Community
                  </h2>
                  <div className="bg-grey-100 h-min py-8">
                    <CreateCommunityFormWrapper />
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
