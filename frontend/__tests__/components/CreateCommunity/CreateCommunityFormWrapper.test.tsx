import CreateCommunityFormWrapper from "@/components/CreateCommunity/CreateCommunityFormWrapper";
import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CommunityResponsePOST } from "@/types/response";
import "@testing-library/jest-dom";

const community: CommunityResponsePOST = {
  id: "123",
  name: "community_test",
  bio: "Test bio.",
  avatar: null,
  banner: null,
  isDeleted: false,
  createdAt: "2025-02-13T18:33:35.610Z",
  updatedAt: "2025-03-12T20:09:55.245Z",
};

const successObj = {
  message: "Successfully created community",
  community: community,
};

const failureObj = {
  error: {
    message: "You are not authenticated",
  },
};

const failureObj422 = {
  error: {
    validationError: [
      {
        field: "name",
        value: "Client_First_Community",
        msg: "Community name is already taken",
      },
    ],
  },
};

type Config = { body: FormData };

global.fetch = jest
  .fn(
    (
      //eslint-disable-next-line
      _url,
      //eslint-disable-next-line
      config: Config
    ): Promise<{ status: number; json: () => Promise<object> }> => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(successObj),
      });
    }
  )
  .mockImplementationOnce(
    //eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 401,
        json: () => Promise.resolve(failureObj),
      });
    })
  )
  .mockImplementationOnce(
    //eslint-disable-next-line
    jest.fn((_url, config: Config) => {
      return Promise.resolve({
        status: 422,
        json: () => Promise.resolve(failureObj422),
      });
    })
  ) as jest.Mock;

describe("Render CreateCommunityWrapper", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() =>
      render(<CreateCommunityFormWrapper></CreateCommunityFormWrapper>)
    );
  });

  test("Test failure onsubmit 401", async () => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((string: string) => string));
    const nameInput = screen.getByTestId("crt-cmmnty-name");
    const bioInput = screen.getByTestId("crt-cmmnty-bio");
    const button = screen.getByTestId("crt-cmmnty-sbmt-btn");
    expect(button).toBeDefined();
    await user.type(nameInput, "ABC");
    await user.type(bioInput, "ABC");
    await user.click(button);

    expect(console.log).toHaveBeenCalledWith(failureObj.error.message);
  });

  test("Test failure onsubmit 422", async () => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((string: string) => string));
    const nameInput = screen.getByTestId("crt-cmmnty-name");
    const bioInput = screen.getByTestId("crt-cmmnty-bio");
    const button = screen.getByTestId("crt-cmmnty-sbmt-btn");
    expect(button).toBeDefined();
    await user.type(nameInput, "ABC");
    await user.type(bioInput, "ABC");
    await user.click(button);

    expect(console.log).toHaveBeenCalledWith(
      failureObj422.error.validationError
    );

    const validationError = screen.getByText("Community name is already taken");
    expect(validationError).toBeInTheDocument();
  });

  test("Test success onsubmit", async () => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((string: string) => string));
    const nameInput = screen.getByTestId("crt-cmmnty-name");
    const bioInput = screen.getByTestId("crt-cmmnty-bio");
    const button = screen.getByTestId("crt-cmmnty-sbmt-btn");
    expect(button).toBeDefined();
    await user.type(nameInput, "ABC");
    await user.type(bioInput, "ABC");

    await user.click(button);
    expect(console.log).toHaveBeenCalledWith(successObj.community);
  });
});
