import { DirectMessageAPI, InboxMessageAPI } from "@/types/api";

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

interface DirectMessageAPIResponse {
  message: string;
  error?: {
    message: string;
  };
  directMessage: DirectMessageAPI;
}

interface DirectMessageAPIData extends DirectMessageAPIResponse {
  status: number;
}

const getDirectMessageById = async (
  directMessageId: string
): Promise<DirectMessageAPIData> => {
  const response: Response = await fetch(
    `${DOMAIN_URL}/direct-message/${directMessageId}`,
    {
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );

  const responseData: DirectMessageAPIResponse = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

interface DMMessagesAPIResponse {
  message: string;
  error?: {
    message: string;
  };
  messagesData: InboxMessageAPI[];
  nextCursor: string | null;
  prevCursor: string | null;
}

interface DMMessagesAPIData extends DMMessagesAPIResponse {
  status: number;
}

const getDMMessages = async ({
  DMId,
  cursor,
}: {
  DMId: string;
  cursor: null | string;
}): Promise<DMMessagesAPIData> => {
  const cursorQuery: string = cursor ? `&cursor=${cursor}` : "";
  const response: Response = await fetch(
    `${DOMAIN_URL}/direct-message/${DMId}/messages?limit=30&direction=backward` +
      cursorQuery,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const responseData: DMMessagesAPIResponse = await response.json();

  return {
    status: response.status,
    ...responseData,
  };
};

export {
  getUserDirectMessages,
  type UserDirectMessageResponse,
  getDirectMessageById,
  getDMMessages,
};
