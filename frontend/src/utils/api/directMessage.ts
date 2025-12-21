import { DirectMessageAPI } from "@/types/api";

const DOMAIN_URL: string | undefined = process.env.NEXT_PUBLIC_DOMAIN_URL;

interface UserDirectMessageAPI {
  message: string;
  error?: {
    message: string;
  };
  directMessages?: DirectMessageAPI[];
}

interface UserDirectMessageResponse extends UserDirectMessageAPI {
  status: number;
}

const getUserDirectMessages = async (): Promise<UserDirectMessageResponse> => {
  const response: Response = await fetch(`${DOMAIN_URL}/direct-messages`, {
    method: "GET",
    mode: "cors",
    credentials: "include",
  });

  const responseData: UserDirectMessageAPI = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

export { getUserDirectMessages, type UserDirectMessageResponse };
