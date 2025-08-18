import { CommunityExploreAPI, ErrorAPI, ParticipantAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetCommunitiesFromAPI = {
  name: string;
};

type GetCommunitiesFromAPIWithCursor = GetCommunitiesFromAPI & {
  cursor: string;
};

type GetCommunitiesFromAPIData = {
  status: number;
  message: string;
  error?: ErrorAPI;
  communities?: CommunityExploreAPI[];
  nextCursor?: string;
};

type PostCommunityJoinToAPI = {
  communityId: string;
};

type PostCommunityJoinToAPIData = {
  status: number;
  message: string;
  error?: ErrorAPI;
  participant: ParticipantAPI;
};

type GetCommunityParticipationStatusFromAPI = {
  communityId: string;
};

type GetCommunityParticipationStatusFromAPIData = {
  status: number;
  message: string;
  error: ErrorAPI;
  participationStatus: "PENDING" | "ACTIVE" | "NONE";
};

const getCommunitiesFromAPI = async ({
  name,
}: GetCommunitiesFromAPI): Promise<GetCommunitiesFromAPIData> => {
  const response = await fetch(
    `${DOMAIN_URL}/explore/communities?name=${name}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

const getCommunitiesFromAPIWithCursor = async ({
  name,
  cursor,
}: GetCommunitiesFromAPIWithCursor) => {
  const response = await fetch(
    `${DOMAIN_URL}/explore/communities?name=${name}&curssor=${cursor}`,
    {
      mode: "cors",
      credentials: "include",
      method: "GET",
    }
  );

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

const postCommunityJoinToAPI = async ({
  communityId,
}: PostCommunityJoinToAPI): Promise<PostCommunityJoinToAPIData> => {
  const response = await fetch(`${DOMAIN_URL}/community/${communityId}/join`, {
    mode: "cors",
    credentials: "include",
    method: "POST",
  });

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

const getCommunityParticipationStatusFromAPI = async ({
  communityId,
}: GetCommunityParticipationStatusFromAPI): //eslint-disable-next-line
Promise<GetCommunityParticipationStatusFromAPIData> => {
  const response = await fetch(
    `${DOMAIN_URL}/community/${communityId}/participation-status`,
    {
      method: "GET",
      credentials: "include",
      mode: "cors",
    }
  );

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

export {
  getCommunitiesFromAPI,
  getCommunitiesFromAPIWithCursor,
  postCommunityJoinToAPI,
  getCommunityParticipationStatusFromAPI,
};
