"use client";

import { CommunityAPI } from "@/types/api";
import CommunitiesItem from "./CommunitiesItem";

const CommunitiesList = ({
  communitiesList,
}: {
  communitiesList: CommunityAPI[];
}) => {
  return (
    <ul
      className={
        "overflow-y-auto scrollbar max-h-full flex flex-col p-4 w-full" +
        " box-border"
      }
    >
      {communitiesList.map((community: CommunityAPI) => {
        return <CommunitiesItem key={community.id} community={community} />;
      })}
    </ul>
  );
};

export default CommunitiesList;
