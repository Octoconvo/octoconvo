import { createContext } from "react";

type ActiveModalContext = {
  activeModal: null | React.RefObject<null | HTMLDivElement>;
  setActiveModal: React.Dispatch<
    React.SetStateAction<null | React.RefObject<null | HTMLDivElement>>
  >;
  closeModal: () => void;
  setCloseModal: React.Dispatch<React.SetStateAction<() => void>>;
};

const ActiveModalContext = createContext<ActiveModalContext>({
  activeModal: null,
  setActiveModal: () => {},
  closeModal: () => {},
  setCloseModal: () => {},
});

export { ActiveModalContext };
