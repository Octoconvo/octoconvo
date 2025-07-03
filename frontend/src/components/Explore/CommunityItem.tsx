import { CommunityExploreGET } from "@/types/response";
import { unescapeString } from "@/utils/string";

const CommunityItem = ({ community }: { community: CommunityExploreGET }) => {
  return (
    <li className="flex flex-col bg-black-100 h-[300px] rounded-[8px]">
      <figure className="bg-gr-black-2-r aspect-[3/1] rounded-[8px] rounded-b-none">
        {community.banner && (
          <img
            className="object-center object-cover aspect-[3/1]"
            src={community.banner}
          />
        )}
      </figure>
      <div className="relative p-[32px] pt-[36px] flex-auto">
        <figure className="top-[-28px] absolute rounded-[8px] p-[8px] bg-black-100 w-[min-content]">
          <div className="rounded-[8px] bg-white-100 w-[48px] h-[48px]">
            {community.avatar && (
              <img src={community.avatar} className="rounded-[inherit]" />
            )}
          </div>
        </figure>
        <article className="flex flex-col justify-between h-full">
          <div className="overflow-hidden ">
            <h1 className="text-p font-bold text-white-100 overflow-hidden text-ellipsis">
              {unescapeString(community.name)}
            </h1>
            <p className="text-p text-white-200 overflow-hidden text-ellipsis">
              {community.bio && unescapeString(community.bio)}
            </p>
          </div>
          <p
            data-testid="cmmnty-itm-prtcpnts"
            className="text-s text-white-200"
          >
            {community._count.participants +
              " " +
              (community._count.participants === 1 ? "member" : "members")}
          </p>
        </article>
      </div>
    </li>
  );
};

export default CommunityItem;
