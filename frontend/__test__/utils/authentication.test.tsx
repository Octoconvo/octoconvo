import { checkAuthStatus, logout } from "@/utils/authentication";

const successObj = {
  message: "You are authenticated",
  user: {
    id: 12345678,
  },
};

const successObjLogout = {
  message: "Successfully logout",
};

const errObjLogout = {
  message: "Failed to logout",
};

type Config = { body: URLSearchParams };

global.fetch = jest
  .fn()
  .mockImplementationOnce(
    // eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(successObj),
      });
    })
  )
  .mockImplementationOnce(
    // eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(successObjLogout),
      });
    })
  )
  .mockImplementationOnce(
    // eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 400,
        json: () => Promise.resolve(errObjLogout),
      });
    })
  )
  .mockImplementationOnce(
    // eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve().then(() => {
        throw new Error("Network Error");
      });
    })
  ) as jest.Mock;

describe("Test checkAuthStatus function", () => {
  test("Return user obj if user is logged in", async () => {
    const user = await checkAuthStatus();
    expect(user).toBe(successObj.user);
  });
});

describe("Test logout function", () => {
  test("Run successHandler when fetch is successful", async () => {
    const successHandler = jest.fn();
    const errorHandler = jest.fn();
    await logout({ successHandler, errorHandler });
    expect(successHandler).toHaveBeenCalled();
  });

  test("Run errorHandler when response status >= 400", async () => {
    const successHandler = jest.fn();
    const errorHandler = jest.fn();
    await logout({ successHandler, errorHandler });
    expect(errorHandler).toHaveBeenCalled();
  });

  test("Run errorHandler on caught error", async () => {
    const successHandler = jest.fn();
    const errorHandler = jest.fn();
    await logout({ successHandler, errorHandler });
    expect(errorHandler).toHaveBeenCalled();
  });
});
