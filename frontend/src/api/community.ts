import { ValidationError } from "@/types/form";
import { CommunityExploreGET } from "@/types/response";

const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type GetCommunitiesFromAPI = {
  name: string;
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

export { getCommunitiesFromAPI };
