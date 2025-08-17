import { ValidationError } from "@/types/form";
import { CommunityExploreGET, ParticipantAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetCommunitiesFromAPI = {
  name: string;
};

type GetCommunitiesFromAPIWithCursor = GetCommunitiesFromAPI & {
  cursor: string;
};

type GetCommunitiesFromAPIReturnValue = {
  status: number;
  message: string;
  error?: {
    message?: string;
    validationErrors: ValidationError[];
  };
  communities?: CommunityExploreGET[];
  nextCursor?: string;
};

type PostCommunityJoinToAPI = {
  communityId: string;
};

type PostCommunityJoinToAPIReturnValue = {
  status: number;
  message: string;
  error?: {
    message?: string;
    validationErrors: ValidationError[];
  };
  participant: ParticipantAPI;
};

type GetCommunityParticipationStatusFromAPI = {
  communityId: string;
};

type GetCommunityParticipationStatusFromAPIReturnValue = {
  status: number;
  message: string;
  error?: {
    message?: string;
    validationErrors: ValidationError[];
  };
  participationStatus: "PENDING" | "ACTIVE" | "NONE";
};

const getCommunitiesFromAPI = async ({
  name,
}: GetCommunitiesFromAPI): Promise<GetCommunitiesFromAPIReturnValue> => {
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
}: PostCommunityJoinToAPI): Promise<PostCommunityJoinToAPIReturnValue> => {
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
Promise<GetCommunityParticipationStatusFromAPIReturnValue> => {
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
