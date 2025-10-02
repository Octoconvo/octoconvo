import { UserFriendAPI } from "@/types/api";
import { FC } from "react";
import FriendItem from "./FriendItem";

interface FriendListProps {
  friends: UserFriendAPI[];
}

const FriendList: FC<FriendListProps> = ({ friends }) => {
  return (
    <>
      {friends.map((friend) => {
        return <FriendItem friend={friend} key={friend.friendId} />;
      })}
    </>
  );
};

export default FriendList;
