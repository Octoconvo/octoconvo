import { UserFriendAPI } from "@/types/api";
import { FC } from "react";
import FriendItem from "./FriendItem";

interface FriendListProps {
  friends: UserFriendAPI[];
}

const FriendList: FC<FriendListProps> = ({ friends }) => {
  return (
    <>
      <ul className="flex flex-col gap-[16px] p-[16px] h-full w-full">
        {friends.map((friend) => {
          return <FriendItem friend={friend} key={friend.friendId} />;
        })}
      </ul>
    </>
  );
};

export default FriendList;
