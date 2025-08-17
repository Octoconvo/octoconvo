import { CommunityExploreAPI } from "@/types/api";
import { unescapeString } from "@/utils/string";
import { ActiveExploreCommunity } from "@/contexts/community";
import { useContext } from "react";

const CommunityItem = ({ community }: { community: CommunityExploreAPI }) => {
  const { setActiveCommunity } = useContext(ActiveExploreCommunity);

  return (
    <li className="flex flex-col bg-black-100 h-[300px] rounded-[8px]">
      <button
        data-testid="xplr-cmmnty-itm-btn"
        onClick={() => setActiveCommunity(community)}
      >
        <figure
          className={
            "bg-gr-black-2-r aspect-[3/1] rounded-[8px]" + " rounded-b-none"
          }
        >
          {community.banner && (
            <img
              className={
                "object-center object-cover w-full aspect-[3/1]" + " max-h-full"
              }
              src={community.banner}
            />
          )}
        </figure>
        <div className="relative p-[32px] pt-[36px] flex-auto">
          <figure
            className={
              "top-[-28px] absolute rounded-[8px] p-[8px]" +
              " bg-black-100 w-[min-content]"
            }
          >
            <div className="rounded-[8px] bg-white-100 w-[48px] h-[48px]">
              {community.avatar && (
                <img src={community.avatar} className="rounded-[inherit]" />
              )}
            </div>
          </figure>
          <article className="flex flex-col justify-between h-full">
            <div className="overflow-hidden">
              <h1
                className={
                  "text-start text-p font-bold text-white-100" +
                  " overflow-hidden text-ellipsis text-nowrap"
                }
              >
                {unescapeString(community.name)}
              </h1>
              <p
                className={
                  "text-start text-p text-white-200 overflow-hidden" +
                  " text-ellipsis text-nowrap"
                }
              >
                {community.bio && unescapeString(community.bio)}
              </p>
            </div>
            <p
              data-testid="cmmnty-itm-prtcpnts"
              className="text-start text-s text-white-200"
            >
              {community._count.participants +
                " " +
                (community._count.participants === 1 ? "member" : "members")}
            </p>
          </article>
        </div>
      </button>
    </li>
  );
};

export default CommunityItem;
