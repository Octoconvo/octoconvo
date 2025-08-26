import { postFriendToAPI } from "@/utils/api/friend";
import { FC, useState } from "react";

type FriendshipStatus = null | "NONE" | "PENDING" | "ACTIVE";

type FriendshipStatusButtonProps = {
  friendshipStatus: FriendshipStatus;
  setFriendshipStatus: React.Dispatch<React.SetStateAction<FriendshipStatus>>;
  friendUsername: string;
};

const friendshipStatusButtonTexts = {
  NONE: "Add Friend",
  PENDING: "Requested",
  ACTIVE: "Friend",
  DEFAULT: "Loading...",
};

const FriendshipStatusButton: FC<FriendshipStatusButtonProps> = ({
  friendUsername,
  friendshipStatus,
  setFriendshipStatus,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sendAFriendRequest = async () => {
    const formData = new URLSearchParams();
    formData.append("username", friendUsername);

    const { status, friends } = await postFriendToAPI({ formData });

    if (status >= 200 && status <= 300 && friends) {
      setFriendshipStatus(friends[0].status);
    }
  };

  return (
    <button
      onClick={async () => {
        if (!isSubmitting) {
          if (friendshipStatus === "NONE") {
            try {
              setIsSubmitting(true);
              await sendAFriendRequest();
            } catch (err) {
              if (err instanceof Error) {
                console.log(err.message);
              }
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      }}
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
