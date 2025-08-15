"use client";

import SearchBar from "@/components/SearchBar/SearchBar";
import { useState, useEffect } from "react";
import { CommunityExploreGET, ProfilesAPI, ProfileAPI } from "@/types/response";
import CommunityBox from "./CommunityBox";
import { SearchBarForm } from "@/types/form";
import CommunityModal from "./CommunityModal";
import { ActiveExploreCommunity } from "@/contexts/community";
import { getProfilesFromAPI } from "@/api/profile";
import { getCommunitiesFromAPI } from "@/api/community";
import ProfileBox from "./ProfileBox";

const ExplorePage = () => {
  const [featuredData, setFeaturedData] = useState<
    null | CommunityExploreGET[]
  >(null);
  const [communityData, setCommunityData] = useState<
    null | CommunityExploreGET[]
  >(null);
  const [profiles, setProfiles] = useState<null | ProfilesAPI>(null);
  const [view, setView] = useState<"COMMUNITY" | "PROFILE" | "DEFAULT">(
    "DEFAULT"
  );
  const path = view === "PROFILE" ? "profiles" : "communities";
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | false>(false);
  const [activeCommunity, setActiveCommunity] =
    useState<null | CommunityExploreGET>(null);
  const [profilesNextCursor, setProfilesNextCursor] = useState<string | false>(
    false
  );

  type SetFeaturedDataStates = {
    featuredData: CommunityExploreGET[];
  };

  const setFeaturedDataStates = ({ featuredData }: SetFeaturedDataStates) => {
    setFeaturedData(featuredData);
  };

  const getFeaturedCommunitiesAndSetCommunitiesStates = async () => {
    const getCommunitiesAPIResponse = await getCommunitiesFromAPI({
      name: "",
    });

    if (
      getCommunitiesAPIResponse.status >= 200 &&
      getCommunitiesAPIResponse.status <= 300 &&
      getCommunitiesAPIResponse.communities !== undefined &&
      getCommunitiesAPIResponse.nextCursor !== undefined
    ) {
      setFeaturedDataStates({
        featuredData: getCommunitiesAPIResponse.communities,
      });
    }
  };

  useEffect(() => {
    try {
      getFeaturedCommunitiesAndSetCommunitiesStates();
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }

    return () => {};
  }, []);

  const setProfilesStates = <ProfilesAPI,>({
    data,
    nextCursor,
  }: {
    data: ProfilesAPI;
    nextCursor: string | false;
  }) => {
    const profiles = data as ProfileAPI[];

    setProfiles(profiles);
    setProfilesNextCursor(nextCursor);
  };

  type UpdateProfilesStatesArgs = {
    profiles: ProfilesAPI;
    fetchedProfiles: ProfilesAPI;
    nextCursor: false | string;
  };

  const updateProfilesStates = ({
    profiles,
    fetchedProfiles,
    nextCursor,
  }: UpdateProfilesStatesArgs) => {
    setProfiles([...profiles, ...fetchedProfiles]);
    setProfilesNextCursor(nextCursor);
  };

  const getProfilesFromAPIAndSetProfilesStates = async () => {
    const getProfilesAPIResponse = await getProfilesFromAPI({
      name: currentQuery,
    });

    if (
      getProfilesAPIResponse.status >= 200 &&
      getProfilesAPIResponse.status <= 300 &&
      getProfilesAPIResponse.profiles !== undefined &&
      getProfilesAPIResponse.nextCursor !== undefined
    ) {
      setProfilesStates({
        data: getProfilesAPIResponse.profiles,
        nextCursor: getProfilesAPIResponse.nextCursor,
      });
    }
  };

  const setCommunitiesStates = <CommunitiesExploreGET,>({
    data,
    nextCursor,
  }: {
    data: CommunitiesExploreGET;
    nextCursor: false | string;
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
      setNextCursor(nextCursor);
    }
  };

  const getCommunitiesFromAPIAndSetCommunitiesStates = async () => {
    const getCommunitiesAPIResponse = await getCommunitiesFromAPI({
      name: currentQuery,
    });

    if (
      getCommunitiesAPIResponse.status >= 200 &&
      getCommunitiesAPIResponse.status <= 300 &&
      getCommunitiesAPIResponse.communities !== undefined &&
      getCommunitiesAPIResponse.nextCursor !== undefined
    ) {
      setCommunitiesStates({
        data: getCommunitiesAPIResponse.communities,
        nextCursor: getCommunitiesAPIResponse.nextCursor,
      });
    }
  };

  const onSuccessFn =
    view === "PROFILE" ? setProfilesStates : setCommunitiesStates;

  return (
    <>
      <ActiveExploreCommunity value={{ activeCommunity, setActiveCommunity }}>
        <SearchBar
          path={path}
          onSubmitFn={(data: SearchBarForm) => {
            if (view === "DEFAULT") {
              setView("COMMUNITY");
            }

            if (view !== "PROFILE") {
              setProfiles(null);
            }

            if (view !== "COMMUNITY") {
              setCommunityData(null);
            }

            setCurrentQuery(data.name);
          }}
          onSuccessFn={onSuccessFn}
          onResetFn={() => {
            setView("DEFAULT");
            setCommunityData(null);
            setCurrentQuery("");
            setProfiles(null);
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
              onClick={async () => {
                setView("COMMUNITY");

                if (communityData === null) {
                  try {
                    await getCommunitiesFromAPIAndSetCommunitiesStates();
                  } catch (err) {
                    if (err instanceof Error) console.log(err.message);
                  }
                }
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
              onClick={async () => {
                setView("PROFILE");

                if (profiles === null) {
                  try {
                    await getProfilesFromAPIAndSetProfilesStates();
                  } catch (err) {
                    if (err instanceof Error) console.log(err.message);
                  }
                }
              }}
              className={
                "px-[16px] py-[8px] rounded-[4px]" +
                (view === "PROFILE"
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
        {view === "PROFILE" &&
          (profiles && profiles.length > 0 ? (
            <ProfileBox
              profiles={profiles}
              nextCursor={profilesNextCursor}
              nameQuery={currentQuery}
              updateProfilesStates={updateProfilesStates}
            />
          ) : (
            "No Profiles found"
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
