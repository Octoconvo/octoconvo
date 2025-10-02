"use client";

import Image from "next/image";
import { CommunityAPI } from "@/types/api";
import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { unescapeString } from "@/utils/stringUtils";

const CommunitiesItem = ({ community }: { community: CommunityAPI }) => {
  const [isHovered, setIsHovered] = useState(false);
  const linkRef = useRef<null | HTMLAnchorElement>(null);
  const { communityid } = useParams();

  return (
    <li
      data-testid="cmmnts-cmmnty-lst"
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={
        "flex box-border w-full max-w-full border-b-[1px] flex-shrink-0" +
        " border-[#80fffb1a] overflow-hidden min-h-[min-content]"
      }
    >
      <button
        onClick={() => {
          if (linkRef.current) {
            linkRef.current.click();
          }
        }}
        className={
          "flex w-full box-border items-center gap-4 p-8 font-semibold" +
          " text-h6 hover:bg-black-500 rounded-[8px]" +
          (communityid === community.id ? " bg-brand-1-2 hover:bg-brand-1" : "")
        }
      >
        <div
          data-testid="cmmnts-cmmnty-lst-avatar-cntnr"
          className={
            "w-12 h-12 min-w-[64px] min-h-[64px] rounded-tr-[8px]" +
            " rounded-br-[8px]" +
            (isHovered || communityid === community.id
              ? " bg-black-100"
              : " bg-gr-main-r")
          }
        >
          {community.avatar && (
            <Image
              className="rounded-[inherit] min-w-[64px] min-h-[64px]"
              src={community.avatar}
              alt={`${community.name} avatar`}
              width={64}
              height={64}
            />
          )}
        </div>
        <Link
          className="box-border max-w-full overflow-hidden text-ellipsis text-nowrap"
          ref={linkRef}
          href={`/lobby/communities/${community.id}`}
        >
          {unescapeString(community.name)}
        </Link>
      </button>
    </li>
  );
};

export default CommunitiesItem;
