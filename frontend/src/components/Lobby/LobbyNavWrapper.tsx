"use client";

import { useContext, useRef, useState } from "react";
import LobbyNav from "./LobbyNav";
import ProfileModal from "@/components/ProfileModal";
import { UserProfileContext } from "@/contexts/user";
import {
  UserProfileModalContext,
  NotificationModalContext,
} from "@/contexts/modal";
import NotificationModal from "@/components/Notification/NotificationModal";

const LobbyNavWrapper = () => {
  const { userProfile } = useContext(UserProfileContext);
  const userProfileModal = useRef<null | HTMLDivElement>(null);
  const notificationModal = useRef<null | HTMLDivElement>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);
  const [isNotificationModalAnimating, setIsNotificationModalAnimating] =
    useState<boolean>(false);

  return (
    <div className="relative z-10">
      <NotificationModalContext
        value={{
          notificationModal,
          toggleNotificationModalView: () => {
            setIsNotificationModalAnimating(true);
            setIsNotificationModalOpen(!isNotificationModalOpen);
          },
          isNotificationModalOpen,
          isNotificationModalAnimating,
        }}
      >
        <UserProfileModalContext.Provider value={{ userProfileModal }}>
          <LobbyNav />
          <ProfileModal profileData={userProfile} />
          <NotificationModal />
        </UserProfileModalContext.Provider>
      </NotificationModalContext>
    </div>
  );
};

export default LobbyNavWrapper;
