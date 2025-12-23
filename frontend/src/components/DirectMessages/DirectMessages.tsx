"use client";

import { FC } from "react";
import DirectMessageList from "./DirectMessageList";
import { useQuery } from "@tanstack/react-query";
import Loader from "../loader";
import { getUserDirectMessages } from "@/api/directMessage";

interface DirectMessagesContainerProps {
  children: React.ReactNode;
}

const DirectMessagesContainer: FC<DirectMessagesContainerProps> = ({
  children,
}) => {
  return (
    <div className="h-full">
      <div
        className="flex flex-col w-[480px] h-full bg-black-200 border-r-[1px]
    border-r-[rgba(81,77,86,0.2)]"
      >
        <h2 className="text-h5 font-bold bg-gr-black-1-r py-[24px] text-center">
          Direct Messages
        </h2>
        {children}
      </div>
    </div>
  );
};

const DirectMessages = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["directMessages"],
    queryFn: async () => await getUserDirectMessages(),
  });

  if (isPending) {
    return (
      <DirectMessagesContainer>
        <div className="w-full flex justify-center p-[16px]">
          <div className="w-[64px] h-[64px]">
            <Loader size={64} />
          </div>
        </div>
      </DirectMessagesContainer>
    );
  }

  if (error) {
    return (
      <DirectMessagesContainer>
        <p>{`An error has occured`}</p>
      </DirectMessagesContainer>
    );
  }

  return (
    <DirectMessagesContainer>
      <DirectMessageList directMessages={data.directMessages || []} />
    </DirectMessagesContainer>
  );
};

export default DirectMessages;
