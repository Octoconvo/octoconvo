"use client";

import { useState } from "react";
import { ActiveModalContext } from "@/contexts/modal";

const ActiveModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModal, setActiveModal] =
    useState<null | React.RefObject<null | HTMLDivElement>>(null);
  const [closeModal, setCloseModal] = useState<() => void>(() => {});

  return (
    <div
      className="flex w-full"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          closeModal();

          setActiveModal(null);
          setCloseModal(() => {});
        }
      }}
      onClick={(e) => {
        if (activeModal) {
          const isChildren = activeModal?.current?.contains(
            e.target as HTMLElement
          );

          console.log(isChildren);
          if (!isChildren && activeModal?.current !== e.target) {
            closeModal();

            setActiveModal(null);
            setCloseModal(() => {});
          }
        }
      }}
    >
      <ActiveModalContext.Provider
        value={{ activeModal, setActiveModal, closeModal, setCloseModal }}
      >
        {children}
      </ActiveModalContext.Provider>
    </div>
  );
};

export default ActiveModalProvider;
