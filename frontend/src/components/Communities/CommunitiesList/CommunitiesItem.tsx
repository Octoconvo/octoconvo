"use client";

import Image from "next/image";
import { CommunitiesResponseGET } from "@/types/response";
import { useState } from "react";

const CommunitiesItem = ({
  community,
}: {
  community: CommunitiesResponseGET;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      data-testid="cmmnts-cmmnty-lst"
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className="flex w-full"
    >
      <button className="flex w-full items-center gap-4 p-8 font-semibold text-h6 hover:bg-brand-1 hover:rounded-[8px]">
        <div
          data-testid="cmmnts-cmmnty-lst-avatar-cntnr"
          className={
            "w-12 h-12  rounded-tr-[8px] rounded-br-[8px]" +
            (isHovered ? " bg-black-100" : " bg-gr-main-r")
          }
        >
          {community.avatar && (
            <Image
              className="rounded-[inherit]"
              src={community.avatar}
              alt={`${community.name} avatar`}
              width={64}
              height={64}
            />
          )}
        </div>

        {community.name}
      </button>
    </li>
  );
};

export default CommunitiesItem;
