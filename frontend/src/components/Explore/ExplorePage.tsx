"use client";

import SearchBar from "@/components/SearchBar/SearchBar";
import { useState, useEffect, useRef } from "react";
import { CommunityExploreGET } from "@/types/response";
import CommunityBox from "./CommunityBox";
import { SearchBarForm } from "@/types/form";
import CommunityModal from "./CommunityModal";
import { ActiveExploreCommunity } from "@/contexts/community";

const ExplorePage = () => {
  const [featuredData, setFeaturedData] = useState<
    null | CommunityExploreGET[]
  >(null);
  const [communityData, setCommunityData] = useState<
    null | CommunityExploreGET[]
  >(null);
  const [view, setView] = useState<"COMMUNITY" | "USER" | "DEFAULT">("DEFAULT");
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | false>(false);
  const [activeCommunity, setActiveCommunity] =
    useState<null | CommunityExploreGET>(null);

  useEffect(() => {
    const fetchFeaturedData = async () => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/explore/communities`, {
          method: "GET",
          credentials: "include",
        });

        const resData = await res.json();

        console.log(resData);
        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          setFeaturedData(resData.communities);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    if (!featuredData) {
      fetchFeaturedData();
    }

    return () => {};
  }, [featuredData]);

  type CommunitiesType = CommunityExploreGET[];

  const onSuccessFn = <CommunitiesType,>({
    data,
    nextCursor,
  }: {
    data: CommunitiesType;
    nextCursor: string | false;
  }) => {
    const communities = data as CommunityExploreGET[];

    setCommunityData(communities);
    setNextCursor(nextCursor);
  };

  const updateData = ({
    communities,
    nextCursor,
  }: {
    communities: CommunityExploreGET[];
    nextCursor: false | string;
  }) => {
    if (communityData !== null) {
      setCommunityData([...communityData, ...communities]);
    }

    setNextCursor(nextCursor);
  };

  return (
    <>
      <ActiveExploreCommunity value={{ activeCommunity, setActiveCommunity }}>
        <SearchBar
          onSubmitFn={(data: SearchBarForm) => {
            setView("COMMUNITY");
            setCurrentQuery(data.name);
          }}
          onSuccessFn={onSuccessFn}
          onResetFn={() => {
            setView("DEFAULT");
            setCommunityData(null);
            setCurrentQuery("");
          }}
        />
        {view === "DEFAULT" && (
          <CommunityBox infiniteScrollData={false} Communities={featuredData} />
        )}
        {view !== "DEFAULT" && (
          <nav
            data-testid="explr-pg-nav"
            className="flex bg-gr-black-1-b self-start p-[8px] gap-[16px]"
          >
            <button
              data-testid="explr-pg-cmmnty-btn"
              onClick={() => {
                setView("COMMUNITY");
              }}
              className={
                "px-[16px] py-[8px] rounded-[4px]" +
                (view === "COMMUNITY"
                  ? " bg-brand-1-2 hover:bg-brand-1"
                  : " bg-grey-100 hover:bg-black-500")
              }
            >
              Community
            </button>
            <button
              data-testid="explr-pg-usr-btn"
              onClick={() => {
                setView("USER");
              }}
              className={
                "px-[16px] py-[8px] rounded-[4px]" +
                (view === "USER"
                  ? " bg-brand-1-2 hover:bg-brand-1"
                  : " bg-grey-100 hover:bg-black-500")
              }
            >
              User
            </button>
          </nav>
        )}
        {view === "COMMUNITY" &&
          communityData &&
          (communityData.length > 0 ? (
            <CommunityBox
              Communities={communityData}
              infiniteScrollData={{ nextCursor, currentQuery, updateData }}
            />
          ) : (
            "No Data found"
          ))}
        {activeCommunity && (
          <CommunityModal
            community={activeCommunity}
            onCloseFn={() => setActiveCommunity(null)}
          />
        )}
      </ActiveExploreCommunity>
    </>
  );
};

export default ExplorePage;
