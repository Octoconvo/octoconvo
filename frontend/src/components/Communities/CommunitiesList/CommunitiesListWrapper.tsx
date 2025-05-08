"use client";

import CommunitiesList from "./CommunitiesList";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/contexts/user";
import { CommunitiesResponseGET } from "@/types/response";

const CommunitiesListWrapper = () => {
  const { user } = useContext(UserContext);
  const [userCommunities, setUserCommunities] = useState<
    CommunitiesResponseGET[]
  >([]);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/communities`, {
          method: "GET",
          credentials: "include",
        });

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          console.log(resData.communities);
          setUserCommunities(resData.communities);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    if (user) {
      fetchUserCommunities();
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center bg-black-200 border-l-[2px] border-[#45009933] animate-slide-right">
      <h3 className="text-center bg-gr-main-r py-6 px-8 text-h5 font-bold w-[480px]">
        Communities
      </h3>
      <CommunitiesList communitiesList={userCommunities} />
    </div>
  );
};

export default CommunitiesListWrapper;
