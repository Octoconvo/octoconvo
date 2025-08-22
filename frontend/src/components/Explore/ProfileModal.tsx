"use client";

import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import { formatDateString } from "@/utils/date";
import { ProfileAPI } from "@/types/api";
import { getFriendshipStatusFromAPI } from "@/utils/api/friend";
import FriendshipStatusButton from "./FriendshipStatusButton";

type ProfileModalProps = {
  profile: ProfileAPI;
  onClose: () => void;
};

type FriendshipStatus = "NONE" | "PENDING" | "ACTIVE" | null;

const ProfileModal: FC<ProfileModalProps> = ({ profile, onClose }) => {
  const profileModalRef = useRef<null | HTMLDivElement>(null);
  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendshipStatus>(null);

  const loadFriendshipStatus = async () => {
    try {
      const { status, friendshipStatus } = await getFriendshipStatusFromAPI({
        username: profile.username,
      });

      if (status >= 200 && status <= 300 && friendshipStatus) {
        setFriendshipStatus(friendshipStatus);
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  };

  const closeOnEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const closeOnClickingOutsideModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const profileModalElement = profileModalRef.current;

    if (profileModalElement) {
      // Don't close the modal if the clicked element is withnin the modal
      const isChildren = profileModalElement.contains(
        e.target as HTMLDivElement
      );

      // Close the modal if the clicked element is outside of the modal
      if (!isChildren && profileModalElement !== e.target) {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (friendshipStatus === null) {
      loadFriendshipStatus();
    }

    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [friendshipStatus]);

  return (
    <div
      data-testid="profile-modal-wrapper"
      className={
        "absolute left-0 top-0 flex justify-center" +
        " items-center w-full h-full backdrop-blur-sm z-20"
      }
      onClick={(e) => {
        closeOnClickingOutsideModal(e);
      }}
    >
      <div
        ref={profileModalRef}
        data-testid="profile-modal"
        className={"bg-black-200 " + `rounded-[8px] z-20`}
      >
        <div
          className={
            "bg-black-400 w-[480px] rounded-[inherit] border-b-solid " +
            "border-b-brand-1-2 border-b-8"
          }
        >
          <article className="rounded-[inherit]">
            <figure
              className={
                "relative h-[115px] max-w-full bg-gr-black-2-r" +
                " rounded-t-[inherit]"
              }
            >
              {profile?.banner && (
                <Image
                  data-testid="banner"
                  src={profile?.banner}
                  fill
                  className={
                    "object-cover object-center rounded-[inherit]" +
                    " max-h-(100%)"
                  }
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
                    data-testid="profile-modal-avatar"
                    src={
                      profile?.avatar
                        ? profile?.avatar
                        : "/images/avatar_icon.svg"
                    }
                    width={64}
                    height={64}
                    className={
                      "rounded-full min-w-[64px] min-h-[64px]" + " bg-white-200"
                    }
                    alt="User avatar"
                  ></Image>
                </figure>
                <div className="flex justify-end gap-[16px]">
                  <FriendshipStatusButton friendshipStatus={friendshipStatus} />
                  <button
                    data-testid="message-btn"
                    className={
                      "bg-grey-100 text-white-100 py-1 px-4 rounded-[4px] " +
                      "font-normal leading-normal " +
                      "hover:bg-brand-1"
                    }
                  >
                    <span className="msg-icon w-[16px] h-[16px]"></span>
                  </button>
                </div>
                <h1
                  data-testid="display-name"
                  className="text-h6 text-white-100 font-regular leading-normal"
                >
                  {profile?.displayName}
                </h1>
                <p
                  data-testid="username"
                  className="text-s font-bold leading-normal text-white-200"
                >
                  @{profile?.username}
                </p>
              </header>
              <p
                data-testid="profile-modal-bio"
                className="text-white-200 leading-normal text-p"
              >
                {profile?.bio || "No bio yet."}
              </p>
              <footer>
                <p className="text-brand-3-d-1 text-s leading-normal">
                  Member since
                </p>
                <p
                  data-testid="membersince"
                  className={
                    "text-white-200 text-s leading-normal font-extralight"
                  }
                >
                  {profile?.createdAt && formatDateString(profile?.createdAt)}
                </p>
              </footer>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
