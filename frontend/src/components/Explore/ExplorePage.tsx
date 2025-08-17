"use client";

import SearchBar from "@/components/SearchBar/SearchBar";
import { useState, useEffect } from "react";
import { CommunityExploreGET, ProfilesAPI, ProfileAPI } from "@/types/api";
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

  const loadFeaturedData = async () => {
    try {
      const { status, communities: featuredData } = await getCommunitiesFromAPI(
        {
          name: "",
        }
      );

      if (status >= 200 && status <= 300 && featuredData !== undefined) {
        setFeaturedData(featuredData);
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  useEffect(() => {
    loadFeaturedData();

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

  type UpdateProfilesStates = {
    profiles: ProfilesAPI;
    fetchedProfiles: ProfilesAPI;
    nextCursor: false | string;
  };

  const updateProfilesStates = ({
    profiles,
    fetchedProfiles,
    nextCursor,
  }: UpdateProfilesStates) => {
    setProfiles([...profiles, ...fetchedProfiles]);
    setProfilesNextCursor(nextCursor);
  };

  const loadProfiles = async () => {
    const { status, profiles, nextCursor } = await getProfilesFromAPI({
      name: nameQuery,
    });

    if (
      status >= 200 &&
      status <= 300 &&
      profiles !== undefined &&
      nextCursor !== undefined
    ) {
      setProfilesStates({
        data: profiles,
        nextCursor: nextCursor,
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

  type updateCommunitiesStates = {
    communities: CommunityExploreGET[];
    fetchedCommunities: CommunityExploreGET[];
    nextCursor: false | string;
  };

  const updateCommunitiesStates = ({
    communities,
    fetchedCommunities,
    nextCursor,
  }: updateCommunitiesStates) => {
    setCommunities([...communities, ...fetchedCommunities]);
    setNextCursor(nextCursor);
  };

  const loadCommunities = async () => {
    try {
      const { status, communities, nextCursor } = await getCommunitiesFromAPI({
        name: nameQuery,
      });

      if (
        status >= 200 &&
        status <= 300 &&
        communities !== undefined &&
        nextCursor !== undefined
      ) {
        setCommunitiesStates({
          data: communities,
          nextCursor: nextCursor,
        });
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
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
                  await loadCommunities();
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
                  await loadProfiles();
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
