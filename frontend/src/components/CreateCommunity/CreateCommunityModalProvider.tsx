"use client";

import { CreateCommunityModalContext } from "@/contexts/modal";
import { useRef } from "react";
import CreateCommunityModal from "@/components/CreateCommunity/CreateCommunityModal";

const CreateCommunityModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const createCommunityModalRef = useRef<null | HTMLDivElement>(null);

  return (
    <CreateCommunityModalContext
      value={{ createCommunityModal: createCommunityModalRef }}
    >
      <CreateCommunityModal />
      {children}
    </CreateCommunityModalContext>
  );
};

export default CreateCommunityModalProvider;
