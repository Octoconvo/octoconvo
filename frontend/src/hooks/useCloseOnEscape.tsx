import { useEffect } from "react";

interface CloseModal {
  (): void;
}

interface UseCloseOnEscapeProps {
  closeModal: CloseModal;
}

const useCloseOnEscape = ({ closeModal }: UseCloseOnEscapeProps) => {
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeModal]);
};

export default useCloseOnEscape;
