import LobbyNav from "./LobbyNav";
import ProfileModal from "./ProfileModal";

const LobbyNavWrapper = () => {
  return (
    <div className="relative">
      <LobbyNav />
      <ProfileModal />
    </div>
  );
};

export default LobbyNavWrapper;
