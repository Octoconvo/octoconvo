import { createContext } from "react";

type ProfileVisibilityContext = {
  profileVisibility: boolean;
  setProfileVisibility: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileVisibilityContext = createContext<ProfileVisibilityContext>({
  profileVisibility: false,
  setProfileVisibility: () => {},
});

export { ProfileVisibilityContext };
