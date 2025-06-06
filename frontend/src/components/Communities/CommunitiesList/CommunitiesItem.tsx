"use client";

import Image from "next/image";
import { CommunitiesResponseGET } from "@/types/response";
import { useRef, useState } from "react";
import Link from "next/link";

const CommunitiesItem = ({ community }: { community: CommunitiesResponseGET }) => {
  const [isHovered, setIsHovered] = useState(false);
  const linkRef = useRef<null | HTMLAnchorElement>(null);

  return (
    <li
      data-testid="cmmnts-cmmnty-lst"
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className="flex box-border w-full max-w-full border-b-[1px] border-[#80fffb1a] overflow-hidden"
    >
      <button
        onClick={() => {
          if (linkRef.current) {
            linkRef.current.click();
          }
        }}
        className="flex w-full box-border items-center gap-4 p-8 font-semibold text-h6 hover:bg-brand-1 hover:rounded-[8px]"
      >
        <div
          data-testid="cmmnts-cmmnty-lst-avatar-cntnr"
          className={
            "w-12 h-12 min-w-[64px] min-h-[64px] rounded-tr-[8px] rounded-br-[8px]" +
            (isHovered ? " bg-black-100" : " bg-gr-main-r")
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
          className="box-border max-w-full overflow-hidden text-ellipsis"
          ref={linkRef}
          href={`/lobby/communities/${community.id}`}
        >
          {community.name}
        </Link>
      </button>
    </li>
  );
};

export default CommunitiesItem;
