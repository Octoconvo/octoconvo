import { ProfileAPI } from "@/types/response";
import { ValidationError } from "@/types/form";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetProfilesFromAPI = {
  name: string;
};

type GetProfilesFromAPIReturnValue = {
  status: number;
  message: string;
  error?: {
    message?: string;
    validationErrors?: ValidationError[];
  };
  profiles?: ProfileAPI[];
  nextCursor?: string;
};

const getProfilesFromAPI = async ({
  name,
}: GetProfilesFromAPI): Promise<GetProfilesFromAPIReturnValue> => {
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

export { getProfilesFromAPI };
