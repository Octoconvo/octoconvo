import { DirectMessageAPI } from "@/types/api";
import { FC } from "react";
import DirectMessageListItem from "./DirectMessageListItem";

interface DirectMessageListProps {
  directMessages: DirectMessageAPI[];
}

const DirectMessageList: FC<DirectMessageListProps> = ({ directMessages }) => {
  return (
    <ul className="h-full p-[16px]">
      {directMessages.length ? (
        directMessages.map((DM: DirectMessageAPI) => {
          return <DirectMessageListItem DM={DM} />;
        })
      ) : (
        <p className="text-center w-full text-white-200">No messages yet.</p>
      )}
    </ul>
  );
};

export default DirectMessageList;
