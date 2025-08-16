import { CommunityExploreGET } from "@/types/api";
import { unescapeString } from "@/utils/string";
import { useEffect, useRef, useState } from "react";
import { formatDateString } from "@/utils/date";
import CommunityParticipationButton from "./CommunityParticipationButton";
import { getCommunityParticipationStatusFromAPI } from "@/utils/api/community";

const CommunityModal = ({
  community,
  onCloseFn,
}: {
  community: CommunityExploreGET;
  onCloseFn: () => void;
}) => {
  const communityModalRef = useRef<null | HTMLDivElement>(null);
  const [participationStatus, setParticipationStatus] = useState<
    "NONE" | "PENDING" | "ACTIVE" | null
  >(null);

  const getCommunityParticipationStatusFromAPIAndUpdateParticipationStates =
    async () => {
      const { status, participationStatus } =
        await getCommunityParticipationStatusFromAPI({
          communityId: community.id,
        });

      if (status >= 200 && status <= 300 && participationStatus !== undefined) {
        setParticipationStatus(participationStatus);
      }
    };

  useEffect(() => {
    if (participationStatus === null) {
      try {
        getCommunityParticipationStatusFromAPIAndUpdateParticipationStates();
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    }

    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseFn();
      }
    };

    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [participationStatus]);

  return (
    <div
      data-testid="xplr-cmmnty-mdl-cntnr"
      onClick={(e) => {
        const current = communityModalRef.current;

        if (current) {
          // Don't close the modal if the clicked element is withnin the modal
          const isChildren = current.contains(e.target as HTMLElement);

          // Close the modal if the clicked element is outside of the modal
          if (!isChildren && current !== e.target) {
            onCloseFn();
          }
        }
      }}
      className={
        "absolute w-full m- h-[100dvh] left-0 top-0 flex" +
        " justify-center items-center backdrop-blur-sm z-20"
      }
    >
      <div
        ref={communityModalRef}
        className={
          "animate-jumpy-zoom-in-s max-h-[calc(100dvh-4rem)]" +
          " overflow-y-auto scrollbar flex flex-col bg-black-100 w-[480px]" +
          " rounded-[8px] absolute shadow-[0_8px_var(--brand-1)]"
        }
      >
        <figure
          className={
            "flex items-center bg-gr-black-2-r aspect-[4.17/1] rounded-[8px]" +
            " rounded-b-none min-h-[115px] overflow-hidden object-center"
          }
        >
          {community.banner && (
            <img
              className="object-center object-cover rounded-[inherit]"
              src={community.banner}
            />
          )}
        </figure>
        <div className="relative p-[32px] pt-0 flex-auto">
          <figure
            className={
              "top-[-36px] absolute rounded-[8px] p-[8px]" +
              " bg-black-100 w-[min-content] gap-[16px]"
            }
          >
            <div className="rounded-[8px] bg-white-100 w-[64px] h-[64px]">
              {community.avatar && (
                <img src={community.avatar} className="rounded-[inherit]" />
              )}
            </div>
          </figure>
          <article className="flex flex-col justify-between h-full">
            <div className="flex w-full justify-end py-[16px]">
              <CommunityParticipationButton
                communityId={community.id}
                participationStatus={participationStatus}
                setParticipationStatus={setParticipationStatus}
              />
            </div>
            <div className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[16px] max-w-full">
                <h1 className="break-words text-h6 font-bold text-white-100">
                  {unescapeString(community.name)}
                </h1>
                <p className="break-words text-p text-white-200 max-w-full">
                  {community.bio && unescapeString(community.bio)}
                </p>
              </div>
              <p className="text-s text-white-200">
                {community._count.participants +
                  " " +
                  (community._count.participants === 1 ? "member" : "members")}
              </p>
              <div className="flex flex-col gap-[4pxs]">
                <p className="text-s text-brand-3-d-1">Founded in</p>
                <p className="text-s">
                  {formatDateString(community.createdAt)}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;
