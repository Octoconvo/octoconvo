import { User } from "@/types/user";

const checkAuthStatus = async (): Promise<false | User> => {
  const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

  const response = await fetch(`${domainURL}/account/login`, {
    mode: "cors",
    method: "GET",
    credentials: "include",
  });

  const responseData = await response.json();

  return responseData.user;
};

const logout = async ({
  successHandler,
  errorHandler,
}: {
  successHandler: () => void;
  errorHandler: (err: string) => void;
}) => {
  const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

  try {
    const response = await fetch(`${domainURL}/account/logout`, {
      mode: "cors",
      method: "POST",
      credentials: "include",
    });

    const responseData = await response.json();

    if (response.status >= 400) {
      errorHandler(responseData.message);
    } else {
      successHandler();
    }
  } catch (err) {
    if (err instanceof Error) {
      errorHandler(err.message);
    }
  }
};

export { checkAuthStatus, logout };
