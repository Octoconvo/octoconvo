"use client";

import CommunitiesList from "./CommunitiesList";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/contexts/user";
import { CommunityAPI } from "@/types/api";
import { connectToRoom } from "@/socket/eventHandler";
import socket from "@/socket/socket";

const CommunitiesListWrapper = () => {
  const { user } = useContext(UserContext);
  const [userCommunities, setUserCommunities] = useState<CommunityAPI[]>([]);

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

      socket.emit("subscribe", `communities:${user.id}`);
      socket.on("communitycreate", fetchUserCommunities);
      socket.on(
        "initiate",
        connectToRoom.bind(this, socket, `communities:${user.id}`)
      );
    }

    return () => {
      if (user) {
        socket.emit("unsubscribe", `communities:${user.id}`);
        socket.off("communitycreate", fetchUserCommunities);
        socket.off(
          "initiate",
          connectToRoom.bind(this, socket, `communities:${user.id}`)
        );
      }
    };
  }, [user]);

  return (
    <div
      className={
        "flex flex-col items-center bg-black-200" +
        " animate-slide-right max-h-[100dvh]"
      }
    >
      <h3
        className={
          "text-center bg-gr-black-1-l py-6 px-8 text-h5 font-bold w-full"
        }
      >
        Communities
      </h3>

      <CommunitiesList communitiesList={userCommunities} />
    </div>
  );
};

export default CommunitiesListWrapper;
