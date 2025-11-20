import { DirectMessageAPI } from "@/types/api";
import { FC } from "react";
import Avatar from "../Avatar";

interface DirectMessageListProps {
  directMessages: DirectMessageAPI[];
}

const DirectMessageList: FC<DirectMessageListProps> = ({ directMessages }) => {
  return (
    <div
      className="flex flex-col w-[480px] h-full bg-black-200 border-r-[1px]
    border-r-[rgba(81,77,86,0.2)]"
    >
      <h2 className="text-h5 font-bold bg-gr-black-1-r py-[24px] text-center">
        Direct Messages
      </h2>
      <ul className="h-full p-[16px]">
        {directMessages.map((DM: DirectMessageAPI) => {
          return (
            <li className="rounded-[8px] w-full hover:bg-black-500">
              <article className="flex gap-[16px] p-[32px]">
                <Avatar avatar={DM.recipient.avatar} size="48px" />
                <div className="flex flex-col gap-[8px] w-full overflow-hidden">
                  <h3 className="text-h6 font-semibold">
                    {DM.recipient.displayName}
                  </h3>
                  <p
                    className="text-ellipsis text-nowrap max-w-full
                  overflow-hidden"
                  >
                    {DM.lastMessage.content}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DirectMessageList;
