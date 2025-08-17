import { CommunityExploreGET } from "@/types/api";
import CommunityItem from "./CommunityItem";
import { FC, useEffect, useRef } from "react";
import { getCommunitiesFromAPIWithCursor } from "@/utils/api/community";

type updateCommunitiesStates = {
  communities: CommunityExploreGET[];
  fetchedCommunities: CommunityExploreGET[];
  nextCursor: false | string;
};

type CommunityBox = {
  communities: CommunityExploreGET[];
  nextCursor: false | string;
  nameQuery: string;
  updateCommunitiesStates: ({
    communities,
    fetchedCommunities,
    nextCursor,
  }: updateCommunitiesStates) => void;
  isInfiniteScrollOn: boolean;
};

const CommunityBox: FC<CommunityBox> = ({
  communities,
  nextCursor,
  nameQuery,
  updateCommunitiesStates,
  isInfiniteScrollOn,
}) => {
  const getMoreCommunitiesWithCursorObserverRef = useRef<null | HTMLDivElement>(
    null
  );

  const loadMoreCommunities = async ({
    cursor,
    name,
  }: {
    cursor: string;
    name: string;
  }) => {
    try {
      const {
        status,
        communities: fetchedCommunities,
        nextCursor,
      } = await getCommunitiesFromAPIWithCursor({
        name,
        cursor,
      });

      if (
        status >= 200 &&
        status <= 300 &&
        fetchedCommunities &&
        nextCursor !== undefined
      ) {
        updateCommunitiesStates({
          communities,
          fetchedCommunities,
          nextCursor: nextCursor,
        });
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  useEffect(() => {
    const getMoreCommunitiesWithCursorObserverElement =
      getMoreCommunitiesWithCursorObserverRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && isInfiniteScrollOn && nextCursor) {
        loadMoreCommunities({
          cursor: nextCursor,
          name: nameQuery,
        });
      }
    });

    if (getMoreCommunitiesWithCursorObserverElement) {
      observer.observe(getMoreCommunitiesWithCursorObserverElement);
    }

    return () => {
      if (getMoreCommunitiesWithCursorObserverElement) {
        observer.unobserve(getMoreCommunitiesWithCursorObserverElement);
      }
    };
  });

  return (
    <ul
      data-testid="cmmnty-bx-ulst"
      className={
        "scrollbar gap-[32px] p-[16px] overflow-auto grid" +
        " grid-cols-[repeat(auto-fill,420px)] bg-gr-black-1-b" +
        " max-h-full flex-auto"
      }
    >
      {communities &&
        communities.map((community) => {
          return <CommunityItem key={community.id} community={community} />;
        })}

      <div
        data-testid="obsrvr-nxt"
        ref={getMoreCommunitiesWithCursorObserverRef}
      ></div>
    </ul>
  );
};

export default CommunityBox;
