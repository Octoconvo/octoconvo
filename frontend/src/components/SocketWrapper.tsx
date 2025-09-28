"use client";

import { UserContext } from "@/contexts/user";
import socket from "@/socket/socket";
import { useContext, useEffect, useState } from "react";

const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    console.log("Socket wrapper user", { user });

    if (!isConnected && user) {
      socket.connect();
    }

    if (isConnected && !user) {
      console.log(`%cDisconnecting from the socket...`, `color: #b53300`);
      socket.disconnect();
      setIsConnected(false);
    }

    socket.on("connect", onConnect);

    return () => {};
  }, [user]);

  return <div className="flex flex-auto min-h-[100dvh]">{children}</div>;
};

export default SocketWrapper;
