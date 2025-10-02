"use client";

import { FriendListModalContext } from "@/contexts/modal";
import { FC, useRef, useState } from "react";

interface FriendProviderProps {
  children: React.ReactNode;
}

const FriendProvider: FC<FriendProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const modalRef = useRef<null | HTMLDivElement>(null);

  const toggleView = () => {
    setIsOpen(!isOpen);
    setIsInitial(false);
  };

  return (
    <FriendListModalContext
      value={{
        modalRef: modalRef,
        isOpen,
        isInitial,
        setIsOpen,
        toggleView,
      }}
    >
      {children}
    </FriendListModalContext>
  );
};

export default FriendProvider;
