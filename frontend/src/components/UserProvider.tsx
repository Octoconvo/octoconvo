"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { UserContext } from "@/contexts/user";
import { checkAuthStatus } from "@/utils/authUtils";
import socket from "@/socket/socket";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User | false>(null);

  useEffect(() => {
    const initiateUser = async () => {
      try {
        const userVal = await checkAuthStatus();

        setUser(userVal);

        if (userVal) {
          socket.connect();
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    };

    if (!user) {
      initiateUser();
    }
  }, [user]);

  return (
    <div className="flex flex-auto min-h-[100dvh]">
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    </div>
  );
};

export default UserProvider;
