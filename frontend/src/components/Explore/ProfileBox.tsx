import { ProfileAPI } from "@/types/response";
import ProfileItem from "./ProfileItem";
import { FC, useEffect, useRef } from "react";
import { getProfilesFromAPIWithCursor } from "@/api/profile";

type UpdateProfilesArgs = {
  profiles: ProfileAPI[];
  fetchedProfiles: ProfileAPI[];
  nextCursor: false | string;
};

type ProfileBox = {
  profiles: ProfileAPI[];
  nextCursor: false | string;
  nameQuery: string;
  updateProfilesStates: ({
    profiles,
    fetchedProfiles,
    nextCursor,
  }: UpdateProfilesArgs) => void;
};

const ProfileBox: FC<ProfileBox> = ({
  profiles,
  nextCursor,
  nameQuery,
  updateProfilesStates,
}) => {
  const getMoreProfilesWithCursorObserverRef = useRef(null);

  const getProfilesFromAPIWithCursorAndUpdateProfilesStates = async ({
    cursor,
  }: {
    cursor: string;
  }) => {
    const profilesAPIResponse = await getProfilesFromAPIWithCursor({
      name: nameQuery,
      cursor,
    });

    if (
      profilesAPIResponse.status >= 200 &&
      profilesAPIResponse.status <= 300 &&
      profilesAPIResponse.profiles &&
      profilesAPIResponse.nextCursor
    ) {
      updateProfilesStates({
        profiles,
        fetchedProfiles: profilesAPIResponse.profiles,
        nextCursor: profilesAPIResponse.nextCursor,
      });
    }
  };

  useEffect(() => {
    const getMoreProfilesWithCursorObserverElement =
      getMoreProfilesWithCursorObserverRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log(entries[0].intersectionRatio);
      }

      if (entries[0].isIntersecting && nextCursor) {
        try {
          getProfilesFromAPIWithCursorAndUpdateProfilesStates({
            cursor: nextCursor,
          });
        } catch (err) {
          if (err instanceof Error) {
            console.log(err.message);
          }
        }
      }
    });

    if (getMoreProfilesWithCursorObserverElement) {
      observer.observe(getMoreProfilesWithCursorObserverElement);
    }

    return () => {
      if (getMoreProfilesWithCursorObserverElement) {
        observer.unobserve(getMoreProfilesWithCursorObserverElement);
      }
    };
  }, [profiles, nextCursor, nameQuery]);

  return (
    <div
      className={
        "scrollbar gap-[32px] p-[16px] overflow-auto flex bg-gr-black-1-b" +
        " max-h-full w-full flex-auto"
      }
    >
      <ul
        className={
          "gap-[32px] p-[16px] grid" +
          " grid-cols-[repeat(auto-fill,480px)] max-w-[min(100%,1080px)]" +
          " max-h-full flex-auto"
        }
      >
        {profiles.map((profile) => (
          <ProfileItem profile={profile} key={profile.id} />
        ))}
        <div
          className="h-[64px]"
          ref={getMoreProfilesWithCursorObserverRef}
        ></div>
      </ul>
    </div>
  );
};

export default ProfileBox;
