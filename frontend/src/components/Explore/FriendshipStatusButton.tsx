import { FC } from "react";

type FriendshipStatus = null | "NONE" | "PENDING" | "ACTIVE";

type FriendshipStatusButtonProps = {
  friendshipStatus: FriendshipStatus;
};

const friendshipStatusButtonTexts = {
  NONE: "Add Friend",
  PENDING: "Requested",
  ACTIVE: "Friend",
  DEFAULT: "Loading...",
};

const FriendshipStatusButton: FC<FriendshipStatusButtonProps> = ({
  friendshipStatus,
}) => {
  return (
    <button
      data-testid="friendship-status-btn"
      className={
        "bg-grey-100 text-white-100 py-1 px-4 rounded-[4px] " +
        "font-normal leading-normal " +
        "hover:bg-brand-1 flex items-center gap-[8px]"
      }
    >
      <span className="add-friend-icon w-[16px] h-[16px]"></span>
      {friendshipStatus
        ? friendshipStatusButtonTexts[friendshipStatus]
        : friendshipStatusButtonTexts.DEFAULT}
    </button>
  );
};

export default FriendshipStatusButton;
