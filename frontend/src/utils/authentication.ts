import { User } from "../../@types/user";

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

export { checkAuthStatus };
