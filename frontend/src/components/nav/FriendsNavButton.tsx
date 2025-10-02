import { FriendListModalContext } from "@/contexts/modal";
import { useContext } from "react";

const FriendsNavButton = () => {
  const { toggleView } = useContext(FriendListModalContext);

  return (
    <button
      data-testid="friends-l"
      className="main-nav-link"
      onClick={toggleView}
    >
      <span
        className={
          "lobby-nav-icon" + " after:bg-[url(/images/friends-icon.svg)]"
        }
      ></span>
    </button>
  );
};

export default FriendsNavButton;
