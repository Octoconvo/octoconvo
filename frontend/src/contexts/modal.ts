import { createContext } from "react";

type ActiveModalsContext = {
  activeModals: React.RefObject<null | HTMLDivElement>[];
  openModal: (modal: null | React.RefObject<null | HTMLDivElement>) => void;
  closeModal: () => void;
};

const ActiveModalsContext = createContext<ActiveModalsContext>({
  activeModals: [],
  //eslint-disable-next-line
  openModal: (modal: null | React.RefObject<null | HTMLDivElement>) => {},
  closeModal: () => {},
});

type UserProfileModalContext = {
  userProfileModal: null | React.RefObject<null | HTMLDivElement>;
};

const UserProfileModalContext = createContext<UserProfileModalContext>({
  userProfileModal: null,
});

export { ActiveModalsContext, UserProfileModalContext };
