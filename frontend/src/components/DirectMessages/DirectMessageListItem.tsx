import { DirectMessageAPI } from "@/types/api";
import Avatar from "../Avatar";
import { FC } from "react";
import testIds from "@/utils/tests/testIds";

interface DirectMessageListItemProps {
  DM: DirectMessageAPI;
}

const DirectMessageListItem: FC<DirectMessageListItemProps> = ({ DM }) => {
  return (
    <li key={DM.id} className="rounded-[8px] w-full hover:bg-black-500">
      <article className="flex gap-[16px] p-[32px]">
        <Avatar
          testId={testIds.DMItemAvatar}
          avatar={DM.recipient.avatar}
          size="48px"
        />
        <div className="flex flex-col gap-[8px] w-full overflow-hidden">
          <h3
            data-testid={testIds.DMItemDisplayName}
            className="text-h6 font-semibold"
          >
            {DM.recipient.displayName}
          </h3>
          <p
            data-testid={testIds.DMItemLastMessage}
            className="text-ellipsis text-nowrap max-w-full
                  overflow-hidden"
          >
            {DM.lastMessage.content}
          </p>
        </div>
      </article>
    </li>
  );
};

export default DirectMessageListItem;
