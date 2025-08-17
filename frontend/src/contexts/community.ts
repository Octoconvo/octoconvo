import { CommunityExploreAPI } from "@/types/api";
import { createContext } from "react";

type ActiveExploreCommunity = {
  activeCommunity: null | CommunityExploreAPI;
  setActiveCommunity: React.Dispatch<
    React.SetStateAction<null | CommunityExploreAPI>
  >;
};

const ActiveExploreCommunity = createContext<ActiveExploreCommunity>({
  activeCommunity: null,
  setActiveCommunity: () => {},
});

export { ActiveExploreCommunity };
