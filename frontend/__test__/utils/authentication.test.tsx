import { checkAuthStatus } from "@/utils/authentication";

const successObj = {
  message: "You are authenticated",
  user: {
    id: 12345678,
  },
};
type Config = { body: URLSearchParams };
// eslint-disable-next-line
global.fetch = jest.fn((_url, config: Config) => {
  return Promise.resolve({
    status: 200,
    json: () => Promise.resolve(successObj),
  });
}) as jest.Mock;

describe("Test checkAuthStatus function", () => {
  test("Return user obj if user is logged in", async () => {
    const user = await checkAuthStatus();
    expect(user).toBe(successObj.user);
  });
});
