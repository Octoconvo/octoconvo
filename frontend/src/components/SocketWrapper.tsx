"use client";

import socket from "@/socket/socket";
import { useEffect, useState } from "react";

const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [isConnected]);

  return <div className="flex flex-auto min-h-[100dvh]">{children}</div>;
};

export default SocketWrapper;
