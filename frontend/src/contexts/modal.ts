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

type EditProfileModalContext = {
  editProfileModal: null | React.RefObject<null | HTMLDivElement>;
};

const EditProfileModalContext = createContext<EditProfileModalContext>({
  editProfileModal: null,
});

type CreateCommunityModalContext = {
  createCommunityModal: null | React.RefObject<null | HTMLDivElement>;
};

const CreateCommunityModalContext = createContext<CreateCommunityModalContext>({
  createCommunityModal: null,
});

type NotificationModalContext = {
  notificationModal: null | React.RefObject<null | HTMLDivElement>;
  toggleNotificationModalView: () => void;
  isNotificationModalOpen: boolean;
  isNotificationModalAnimating: boolean;
};

const NotificationModalContext = createContext<NotificationModalContext>({
  notificationModal: null,
  toggleNotificationModalView: () => {},
  isNotificationModalOpen: false,
  isNotificationModalAnimating: false,
});

export {
  ActiveModalsContext,
  EditProfileModalContext,
  UserProfileModalContext,
  CreateCommunityModalContext,
  NotificationModalContext,
};
