"use client";

import { useEffect, useState } from "react";
import { ActiveModalsContext } from "@/contexts/modal";

const ActiveModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeModals, setActiveModals] = useState<
    React.RefObject<null | HTMLDivElement>[]
  >([]);

  const closeModal = () => {
    if (activeModals.length) {
      const updatedModals = activeModals.filter(
        // eslint-disable-ext-line
        (modal: React.RefObject<null | HTMLDivElement>, index: number) =>
          index !== 0
      );

      setActiveModals(updatedModals);
    }
  };

  const openModal = (modal: null | React.RefObject<null | HTMLDivElement>) => {
    if (modal !== null) {
      setActiveModals([modal]);
    }
  };

  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("keydown", closeOnEsc);
    };
  });

  return (
    <div
      className="flex w-full"
      onClick={(e) => {
        if (activeModals.length) {
          activeModals.forEach((modal) => {
            const isChildren = modal.current?.contains(e.target as HTMLElement);

            if (!isChildren && modal.current !== e.target) {
              const updatedModals = activeModals.filter(
                (toFilter) => toFilter !== modal
              );
              setActiveModals(updatedModals);
            }
          });
        }
      }}
    >
      <ActiveModalsContext.Provider
        value={{ activeModals, openModal, closeModal }}
      >
        {children}
      </ActiveModalsContext.Provider>
    </div>
  );
};

export default ActiveModalProvider;
