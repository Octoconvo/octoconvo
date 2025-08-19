import { ProfileAPI } from "@/types/api";
import { createContext } from "react";

type ActiveExploreProfileContext = {
  activeProfile: null | ProfileAPI;
  setActiveProfile: React.Dispatch<React.SetStateAction<null | ProfileAPI>>;
};

const ActiveExploreProfileContext = createContext<ActiveExploreProfileContext>({
  activeProfile: null,
  setActiveProfile: () => {},
});

export { ActiveExploreProfileContext };
