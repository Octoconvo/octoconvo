import { ProfileAPI } from "@/types/api";
import ProfileItem from "./ProfileItem";
import { FC, useEffect, useRef } from "react";
import { getProfilesFromAPIWithCursor } from "@/api/profile";

type UpdateProfiles = {
  profiles: ProfileAPI[];
  fetchedProfiles: ProfileAPI[];
  nextCursor: false | string;
};

type ProfileBoxProps = {
  profiles: ProfileAPI[];
  nextCursor: false | string;
  nameQuery: string;
  updateProfilesStates: ({
    profiles,
    fetchedProfiles,
    nextCursor,
  }: UpdateProfiles) => void;
};

const ProfileBox: FC<ProfileBoxProps> = ({
  profiles,
  nextCursor,
  nameQuery,
  updateProfilesStates,
}) => {
  const getMoreProfilesWithCursorObserverRef = useRef<null | HTMLDivElement>(
    null
  );

  const loadMoreProfiles = async ({ cursor }: { cursor: string }) => {
    try {
      const {
        status,
        profiles: fetchedProfiles,
        nextCursor,
      } = await getProfilesFromAPIWithCursor({
        name: nameQuery,
        cursor,
      });

      if (
        status >= 200 &&
        status <= 300 &&
        fetchedProfiles &&
        nextCursor !== undefined
      ) {
        updateProfilesStates({
          profiles,
          fetchedProfiles: fetchedProfiles,
          nextCursor: nextCursor,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  useEffect(() => {
    const getMoreProfilesWithCursorObserverElement =
      getMoreProfilesWithCursorObserverRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor) {
        loadMoreProfiles({
          cursor: nextCursor,
        });
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
        " max-h-full w-full flex-auto items-start"
      }
    >
      <ul
        data-testid="profile-box-ulist"
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
