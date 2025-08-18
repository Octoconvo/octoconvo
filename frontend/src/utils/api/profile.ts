import { ErrorAPI, ProfileAPI } from "@/types/api";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetProfilesFromAPI = {
  name: string;
};

type GetProfilesFromAPIWithCursor = GetProfilesFromAPI & { cursor: string };

type GetProfilesFromAPIData = {
  status: number;
  message: string;
  error?: ErrorAPI;
  profiles?: ProfileAPI[];
  nextCursor?: string;
};

const getProfilesFromAPI = async ({
  name,
}: GetProfilesFromAPI): Promise<GetProfilesFromAPIData> => {
  const response = await fetch(`${DOMAIN_URL}/explore/profiles?name=${name}`, {
    method: "GET",
    credentials: "include",
  });

  const responseData = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

const getProfilesFromAPIWithCursor = async ({
  name,
  cursor,
}: GetProfilesFromAPIWithCursor): Promise<GetProfilesFromAPIData> => {
  const response = await fetch(
    `${DOMAIN_URL}/explore/profiles?name=${name}&cursor=${cursor}`,
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

export { getProfilesFromAPI, getProfilesFromAPIWithCursor };
