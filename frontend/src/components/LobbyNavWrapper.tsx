"use client";

import { useContext } from "react";
import LobbyNav from "./LobbyNav";
import ProfileModal from "./ProfileModal";
import { UserContext } from "@/contexts/user";

const LobbyNavWrapper = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="relative">
      <LobbyNav />
      <ProfileModal id={user ? user.id : null} />
    </div>
  );
};

export default LobbyNavWrapper;
