import { createContext } from "react";
import { User, UserProfile } from "@/types/user";

type UserContext = {
  user: null | User | false;
  setUser: React.Dispatch<React.SetStateAction<null | User | false>>;
};

const UserContext = createContext<UserContext>({
  user: null,
  setUser: () => {},
});

type UserProfileContext = {
  userProfile: null | UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<null | UserProfile>>;
};

const UserProfileContext = createContext<UserProfileContext>({
  userProfile: null,
  setUserProfile: () => {},
});

export { UserContext, UserProfileContext };
