"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext, UserProfileContext } from "@/contexts/user";
import socket from "@/socket/socket";
import { UserProfile } from "../../@types/user";

const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(UserContext);
  const [userProfile, setUserProfile] = useState<null | UserProfile>(null);

  useEffect(() => {
    const fetchUserProfile = async (id: string) => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/profile/${id}`);
        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          setUserProfile(resData.userProfile);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    if (user) {
      fetchUserProfile(user.id);

      const connectToRoom = () => {
        socket.emit("subscribe", `profile:${user.id}`);
      };

      socket.emit("subscribe", `profile:${user.id}`);
      socket.on("profileupdate", fetchUserProfile);

      socket.on("initiate", connectToRoom);
    }

    return () => {
      if (user) {
        socket.off("initiate");
        socket.off("profileupdate", fetchUserProfile);
        socket.emit("unsubscribe", `profile:${user.id}`);
      }
    };
  }, [user]);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default ProfileProvider;
