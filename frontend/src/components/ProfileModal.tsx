"use client";

import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { UserProfile } from "../../@types/user";
import avatarIcon from "../../public/images/avatar_icon.svg";
import { formatDateString } from "@/utils/date";
import socket from "@/socket/socket";

type ProfileModalProps = {
  id: string | null;
};

const ProfileModal: FC<ProfileModalProps> = ({ id }) => {
  const [userProfile, setUserProfile] = useState<null | UserProfile>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/profile/${id}`, {
          method: "GET",
        });

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          setUserProfile(resData.userProfile);
        }
        // Handle 404 errors
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    const connectToRoom = () => {
      socket.emit("subscribe", `profile:${id}`);
    };

    if (id) {
      fetchUserProfile();

      socket.emit("subscribe", `profile:${id}`);
      socket.on("profileupdate", fetchUserProfile);

      socket.on("initiate", connectToRoom);
    }

    return () => {
      socket.off("initiate");
      socket.off("profileupdate", fetchUserProfile);
      socket.emit("unsubscribe", `profile:${id}`);
    };
  }, [id]);

  return (
    <dialog
      className={
        "absolute left-[calc(100%+1rem)] bottom-[1rem] bg-black-200 " +
        "rounded-[8px]"
      }
      open
    >
      <div
        className={
          "bg-black-400 w-[480px] rounded-[inherit] border-b-solid " +
          "border-b-brand-3 border-b-8"
        }
      >
        <article className="rounded-[inherit]">
          <figure className="relative h-[115px] max-w-full bg-brand-1 rounded-t-[inherit]">
            {userProfile?.banner && (
              <Image
                data-testid="banner"
                src={userProfile?.banner}
                fill
                className="object-cover object-center rounded-[inherit] max-h-(100%)"
                alt="User avatar"
              ></Image>
            )}
          </figure>
          <section className="relative flex flex-col gap-4 bg-black-200 p-8">
            <header>
              <figure
                className={
                  "absolute p-2 top-[calc(-32px-0.25rem)] bg-black-200 " +
                  " min-w-[64px] min-h-[64px] rounded-full"
                }
              >
                <Image
                  data-testid="avatar"
                  src={userProfile?.avatar ? userProfile?.avatar : avatarIcon}
                  width={64}
                  height={64}
                  className="rounded-full bg-brand-4 min-w-[64px] min-h-[64px]"
                  alt="User avatar"
                ></Image>
              </figure>
              <div className="flex justify-end">
                <button
                  data-testid="main-btn"
                  className={
                    "bg-grey-100 text-white-100 py-1 px-4 rounded-[4px] " +
                    "font-normal leading-normal " +
                    "hover:bg-brand-1"
                  }
                >
                  Edit Profile
                </button>
              </div>
              <h1
                data-testid="display-name"
                className="text-h6 text-white-100 font-regular leading-normal"
              >
                {userProfile?.displayName}
              </h1>
              <p
                data-testid="username"
                className="text-s font-bold leading-normal text-white-200"
              >
                @{userProfile?.username}
              </p>
            </header>
            <p
              data-testid="bio"
              className="text-white-200 leading-normal text-p"
            >
              {userProfile?.bio}
            </p>
            <footer>
              <p className="text-brand-3 text-s leading-normal">Member since</p>
              <p
                data-testid="membersince"
                className="text-white-200 text-s leading-normal font-extralight"
              >
                {userProfile?.createdAt &&
                  formatDateString(userProfile?.createdAt)}
              </p>
            </footer>
          </section>
        </article>
        <div className="flex flex-col gap-4 p-8 rounded-[inherit]">
          <div>
            <button className="bg-grey-100 py-2 px-4 text-white-100 rounded-[4px]">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileModal;
