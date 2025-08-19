import { ActiveExploreProfileContext } from "@/contexts/profile";
import { ProfileAPI } from "@/types/api";
import { useContext, FC } from "react";

type ProfileItemProps = { profile: ProfileAPI };

const ProfileItem: FC<ProfileItemProps> = ({ profile }) => {
  const { setActiveProfile } = useContext(ActiveExploreProfileContext);

  return (
    <li className="flex flex-col bg-black-100 p-[32px] rounded-8 h-[150px]">
      <button
        data-testid="open-profile-modal-btn"
        onClick={() => setActiveProfile(profile)}
        className="flex gap-[32px] h-full items-center"
      >
        <figure className="bg-gr-black-2-r min-w-[64px] h-[64px] rounded-full">
          {profile.avatar && (
            <img
              data-testid="profile-item-avatar"
              className={
                "object-center object-cover w-full" +
                " w-full h-full rounded-[inherit]"
              }
              src={profile.avatar}
            />
          )}
        </figure>
        <div
          className={
            "flex flex-col gap-[16px] justify-between" + " overflow-hidden"
          }
        >
          <div className="flex flex-col gap-[4px]">
            <p
              data-testid="profile-item-displayname"
              className={
                "text-white-100 text-start text-ellipsis}" +
                " text-nowrap overflow-hidden"
              }
            >
              {profile.displayName}
            </p>
            <p
              data-testid="profile-item-username"
              className={
                "text-white-200 text-s text-start" +
                " text-ellipsis text-nowrap overflow-hidden"
              }
            >
              @{profile.username}
            </p>
          </div>

          <p
            data-testid="profile-item-bio"
            className={
              "text-white-200 text-start text-ellipsis" +
              " text-nowrap overflow-hidden"
            }
          >
            {profile.bio ? profile.bio : "No bio yet"}
          </p>
        </div>
      </button>
    </li>
  );
};

export default ProfileItem;
