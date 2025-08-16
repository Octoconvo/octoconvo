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
  const [communities, setCommunities] = useState<null | CommunityExploreGET[]>(
    null
  );
  const [profiles, setProfiles] = useState<null | ProfilesAPI>(null);
  const [view, setView] = useState<"COMMUNITY" | "PROFILE" | "DEFAULT">(
    "DEFAULT"
  );
  const path = view === "PROFILE" ? "profiles" : "communities";
  const [nameQuery, setNameQuery] = useState<string>("");
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

  type updateCommunitiesStatesArgs = {
    communities: CommunityExploreGET[];
    fetchedCommunities: CommunityExploreGET[];
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
      name: nameQuery,
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
    setCommunities(communities);
    setNextCursor(nextCursor);
  };

  const updateCommunitiesStates = ({
    communities,
    fetchedCommunities,
    nextCursor,
  }: updateCommunitiesStatesArgs) => {
    setCommunities([...communities, ...fetchedCommunities]);
    setNextCursor(nextCursor);
  };

  const getCommunitiesFromAPIAndSetCommunitiesStates = async () => {
    const getCommunitiesAPIResponse = await getCommunitiesFromAPI({
      name: nameQuery,
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
              setCommunities(null);
            }

            setNameQuery(data.name);
          }}
          onSuccessFn={onSuccessFn}
          onResetFn={() => {
            setView("DEFAULT");
            setCommunities(null);
            setNameQuery("");
            setProfiles(null);
          }}
        />
        {view === "DEFAULT" && featuredData && (
          <CommunityBox
            isInfiniteScrollOn={false}
            communities={featuredData}
            nextCursor={false}
            updateCommunitiesStates={updateCommunitiesStates}
            nameQuery=""
          />
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

                if (communities === null) {
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
          communities &&
          (communities.length > 0 ? (
            <CommunityBox
              communities={communities}
              nextCursor={nextCursor}
              nameQuery={nameQuery}
              updateCommunitiesStates={updateCommunitiesStates}
              isInfiniteScrollOn={true}
            />
          ) : (
            "No Data found"
          ))}
        {view === "PROFILE" &&
          (profiles && profiles.length > 0 ? (
            <ProfileBox
              profiles={profiles}
              nextCursor={profilesNextCursor}
              nameQuery={nameQuery}
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
