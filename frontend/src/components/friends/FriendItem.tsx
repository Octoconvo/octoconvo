import { UserFriendAPI } from "@/types/api";
import { FC } from "react";
import Avatar from "../Avatar";
import { unescapeString } from "@/utils/string";
import testIds from "@/utils/tests/testIds";

interface FriendItemProps {
  friend: UserFriendAPI;
}

const FriendItem: FC<FriendItemProps> = ({ friend }) => {
  return (
    <li className="w-full flex gap-[32px] px-[32px] py-[16px]">
      <Avatar avatar={friend.friend.avatar} size="64px" />
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-[4px]">
          <p data-testid={testIds.friendItemDisplayName}>
            {unescapeString(friend.friend.displayName)}
          </p>
          <p
            data-testid={testIds.friendItemUsername}
            className="text-s font-bold"
          >
            {"@" + unescapeString(friend.friend.username)}
          </p>
        </div>
        <button
          className={
            "flex justify-center items-center w-[48px] h-[48px] bg-grey-100" +
            " rounded-[8px] hover:bg-brand-1-2"
          }
        >
          <span className="msg-icon w-[32px] h-[32px]"></span>
        </button>
      </div>
    </li>
  );
};

export default FriendItem;
