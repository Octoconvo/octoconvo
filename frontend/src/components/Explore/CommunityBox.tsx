import { CommunityExploreGET } from "@/types/response";
import CommunityItem from "./CommunityItem";
import { useEffect, useRef } from "react";

const CommunityBox = ({
  Communities,
  infiniteScrollData,
}: {
  Communities: null | CommunityExploreGET[];
  infiniteScrollData:
    | false
    | {
        nextCursor: string | false;
        currentQuery: string;
        updateData: ({
          communities,
          nextCursor,
        }: {
          communities: CommunityExploreGET[];
          nextCursor: string | false;
        }) => void;
      };
}) => {
  const nextObserverRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const fetchNextCommunities = async ({
      nextCursor,
      currentQuery,
      updateData,
    }: {
      nextCursor: string;
      currentQuery: string;
      updateData: ({
        communities,
        nextCursor,
      }: {
        communities: CommunityExploreGET[];
        nextCursor: string | false;
      }) => void;
    }) => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const response = await fetch(
          `${domainURL}/explore/communities?name=${currentQuery}&cursor=${nextCursor}`,
          {
            mode: "cors",
            credentials: "include",
            method: "GET",
          }
        );

        const responseData = await response.json();

        if (response.status < 400) {
          updateData({
            communities: responseData.communities,
            nextCursor: responseData.nextCursor,
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    };
    const nextObserver = nextObserverRef.current;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => console.log(entry.intersectionRatio));

      if (entries[0].isIntersecting) {
        // Fetch next communities with cursor
        // Fetch if cursor is not false

        if (infiniteScrollData) {
          const { nextCursor, currentQuery, updateData } = infiniteScrollData;

          if (nextCursor) {
            fetchNextCommunities({ nextCursor, currentQuery, updateData });
          }
        }
      }
    });

    if (nextObserver) {
      observer.observe(nextObserver);
    }

    return () => {
      if (nextObserver) {
        observer.unobserve(nextObserver);
      }
    };
  });
  return (
    <ul
      data-testid="cmmnty-bx-ulst"
      className={
        "scrollbar gap-[32px] p-[16px] overflow-auto grid" +
        " grid-cols-[repeat(auto-fill,minmax(420px,1fr))] bg-gr-black-1-b" +
        " max-h-full flex-auto"
      }
    >
      {Communities &&
        Communities.map((community) => {
          return <CommunityItem key={community.id} community={community} />;
        })}

      {infiniteScrollData && (
        <div data-testid="obsrvr-nxt" ref={nextObserverRef}></div>
      )}
    </ul>
  );
};

export default CommunityBox;
