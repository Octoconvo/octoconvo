import { CommunityExploreGET } from "@/types/api";
import { createContext } from "react";

type ActiveExploreCommunity = {
  activeCommunity: null | CommunityExploreGET;
  setActiveCommunity: React.Dispatch<
    React.SetStateAction<null | CommunityExploreGET>
  >;
};

const ActiveExploreCommunity = createContext<ActiveExploreCommunity>({
  activeCommunity: null,
  setActiveCommunity: () => {},
});

export { ActiveExploreCommunity };
