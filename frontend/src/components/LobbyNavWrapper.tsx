"use client";

import { useContext, useEffect, useState } from "react";
import LobbyNav from "./LobbyNav";
import ProfileModal from "./ProfileModal";
import { UserProfileContext } from "@/contexts/user";
import { ProfileVisibilityContext } from "@/contexts/visibility";
import { ActiveModalContext } from "@/contexts/modal";

const LobbyNavWrapper = () => {
  const { userProfile } = useContext(UserProfileContext);
  const [profileVisibility, setProfileVisibility] = useState<boolean>(false);
  const { setCloseModal } = useContext(ActiveModalContext);

  useEffect(() => {
    if (profileVisibility) {
      setCloseModal(() => setProfileVisibility);
    }
  }, [profileVisibility, setCloseModal]);

  return (
    <div className="relative">
      <ProfileVisibilityContext.Provider
        value={{
          profileVisibility,
          setProfileVisibility,
        }}
      >
        <LobbyNav />
        <ProfileModal profileData={userProfile} />
      </ProfileVisibilityContext.Provider>
    </div>
  );
};

export default LobbyNavWrapper;
