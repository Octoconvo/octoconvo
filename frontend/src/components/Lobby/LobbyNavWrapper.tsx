"use client";

import { useContext, useRef } from "react";
import LobbyNav from "./LobbyNav";
import ProfileModal from "@/components/ProfileModal";
import { UserProfileContext } from "@/contexts/user";
import { UserProfileModalContext } from "@/contexts/modal";
import NotificationModal from "@/components/Notification/NotificationModal";
import FriendListModal from "../friends/FriendListModal";

const LobbyNavWrapper = () => {
  const { userProfile } = useContext(UserProfileContext);
  const userProfileModal = useRef<null | HTMLDivElement>(null);

  return (
    <div className="relative z-10">
      <UserProfileModalContext.Provider value={{ userProfileModal }}>
        <LobbyNav />
        <ProfileModal profileData={userProfile} />
        <NotificationModal />
        <FriendListModal />
      </UserProfileModalContext.Provider>
    </div>
  );
};

export default LobbyNavWrapper;
