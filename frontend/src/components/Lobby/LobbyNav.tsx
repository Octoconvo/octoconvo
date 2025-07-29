"use client";

import { UserProfileContext } from "@/contexts/user";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import {
  ActiveModalsContext,
  UserProfileModalContext,
  CreateCommunityModalContext,
} from "@/contexts/modal";
import { usePathname } from "next/navigation";
import NotificationNav from "./NotificationNav";

const LobbyNav = () => {
  const path = usePathname();
  const { userProfile } = useContext(UserProfileContext);
  const { userProfileModal } = useContext(UserProfileModalContext);
  const { createCommunityModal } = useContext(CreateCommunityModalContext);
  const { openModal } = useContext(ActiveModalsContext);

  return (
    <>
      <nav
        className={
          "flex flex-col justify-between h-full bg-black-100 py-12" +
          " px-4 relative z-10"
        }
      >
        <div className="flex flex-col justify-between gap-8">
          <Link
            data-testid="friends-l"
            href={`/lobby/friends`}
            className={
              "flex relative items-center justify-center h-12 transition-all" +
              " hover:shadow-[0_0.25rem_0_0_var(--brand-4)] hover:rounded-[8px]" +
              "  hover:transition-all" +
              (path && path.split("/").includes("friends")
                ? " before:bg-gr-brand-1-3-d-1-b before:w-full before:h-full" +
                  " before:rounded-[8px] before:scale-110 hover:shadow-none" +
                  " hover:before:bg-gr-brand-1-2-3-d-1-t hover:before:scale-110"
                : "")
            }
          >
            <span
              className={
                "lobby-nav-icon" + " after:bg-[url(/images/friends-icon.svg)]"
              }
            ></span>
          </Link>
          <Link
            data-testid="dm-l"
            href={`lobby/dm`}
            className={
              "flex relative items-center justify-center h-12 translation-all" +
              " hover:shadow-[0_0.25rem_0_0_var(--brand-4)] hover:rounded-[8px]" +
              "  hover:transition-all" +
              (path && path.split("/").includes("dm")
                ? " before:bg-gr-brand-1-3-d-1-b before:w-full before:h-full" +
                  " before:rounded-[8px] before:scale-110 hover:shadow-none" +
                  " hover:before:bg-gr-brand-1-2-3-d-1-t hover:before:scale-110"
                : "")
            }
          >
            <span
              className={
                "lobby-nav-icon" + " after:bg-[url(/images/dm-icon.svg)]"
              }
            ></span>
          </Link>
          <Link
            data-testid="communities-l"
            href={`/lobby/communities`}
            className={
              "flex relative items-center justify-center h-12 translation-all" +
              " hover:shadow-[0_0.25rem_0_0_var(--brand-4)] hover:rounded-[8px]" +
              "  hover:transition-all" +
              (path && path.split("/").includes("communities")
                ? " before:bg-gr-brand-1-3-d-1-b before:w-full before:h-full" +
                  " before:rounded-[8px] before:scale-110 hover:shadow-none" +
                  " hover:before:bg-gr-brand-1-2-3-d-1-t hover:before:scale-110"
                : "")
            }
          >
            <span
              className={
                "lobby-nav-icon" +
                " after:bg-[url(/images/octoconvo-community-button-icon.svg)]"
              }
            ></span>
          </Link>

          <Link
            data-testid="explore-l"
            href={`/lobby/explore`}
            className={
              "flex relative items-center justify-center h-12" +
              " before:rounded-[8px] transition-all hover:transition-all" +
              " hover:shadow-[0_0.25rem_0_0_var(--brand-4)] hover:rounded-[8px] " +
              (path && path.split("/").includes("explore")
                ? " before:bg-gr-brand-1-3-d-1-b before:w-full before:h-full" +
                  " before:rounded-[8px] before:scale-110 hover:shadow-none" +
                  " hover:before:bg-gr-brand-1-2-3-d-1-t hover:before:scale-110"
                : "")
            }
          >
            <span
              className={
                "lobby-nav-icon after:bg-[url(/images/explore-icon.svg)]"
              }
            ></span>
          </Link>
          <button
            data-testid="crt-cmmnty-mdl-opn-btn"
            className={
              "flex relative items-center justify-center h-12 before:bg-brand-1" +
              " before:w-full before:h-full before:rounded-full transition-all" +
              " hover:transition-all hover:before:scale-105" +
              " hover:before:rounded-[1rem]"
            }
            onClick={() => {
              openModal(createCommunityModal);
            }}
          >
            <span
              className={
                "lobby-nav-icon" + " after:bg-[url(/images/add-icon.svg)]"
              }
            ></span>
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <NotificationNav />
          <button
            data-testid="profile-btn"
            className="rounded-full h-[3rem] w-[3rem] bg-white-200"
            onClick={() => {
              openModal(userProfileModal);
            }}
          >
            <Image
              data-testid="btn-avatar"
              className="rounded-[inherit]"
              src={
                userProfile && userProfile?.avatar
                  ? userProfile?.avatar
                  : "/images/avatar_icon.svg"
              }
              width={64}
              height={64}
              alt={`${userProfile?.username} avatar`}
            ></Image>
          </button>
        </div>
      </nav>
    </>
  );
};

export default LobbyNav;
