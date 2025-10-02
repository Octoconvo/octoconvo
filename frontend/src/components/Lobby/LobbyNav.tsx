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
import { hasPath } from "@/utils/stringUtils";
import FriendsNavButton from "../nav/FriendsNavButton";

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
            data-testid="dm-l"
            href={`lobby/dm`}
            className={
              "main-nav-link" +
              (hasPath({ path, toCompare: "dm" })
                ? " main-nav-link-active"
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
              " main-nav-link" +
              (hasPath({ path, toCompare: "communities" })
                ? " main-nav-link-active"
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
              "main-nav-link" +
              (hasPath({ path, toCompare: "explore" })
                ? " main-nav-link-active"
                : " ")
            }
          >
            <span
              className={
                "lobby-nav-icon after:bg-[url(/images/explore-icon.svg)]"
              }
            ></span>
          </Link>
          <FriendsNavButton />
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
