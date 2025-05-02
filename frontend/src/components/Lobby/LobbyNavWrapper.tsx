"use client";

import { useContext, useRef } from "react";
import LobbyNav from "./LobbyNav";
import ProfileModal from "@/components/ProfileModal";
import { UserProfileContext } from "@/contexts/user";
import { UserProfileModalContext } from "@/contexts/modal";

const LobbyNavWrapper = () => {
  const { userProfile } = useContext(UserProfileContext);
  const userProfileModal = useRef<null | HTMLDivElement>(null);

  return (
    <div className="relative">
      <UserProfileModalContext.Provider value={{ userProfileModal }}>
        <LobbyNav />
        <ProfileModal profileData={userProfile} />
      </UserProfileModalContext.Provider>
    </div>
  );
};

export default LobbyNavWrapper;
