import EditProfileFormWrapper from "@/components/EditProfile/EditProfileFormWrapper";
import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UserProfileContext } from "@/contexts/user";
import { UserProfile } from "@/types/user";

const userProfile: UserProfile = {
  id: "513c920c-3921-48b2-88d7-5b8156b9e6b8",
  username: "test_username",
  displayName: "test_displayname",
  avatar: "https://www.fakeavatarurl.com",
  banner: "https://www.fakebannerurl.com",
  bio: "Test bio.",
  lastSeen: "2025-02-13T18:33:35.610Z",
  createdAt: "2025-02-13T18:33:35.610Z",
  updatedAt: "2025-03-12T20:09:55.245Z",
};

const successObj = {
  message: "Successfully updated your profile",
  userProfile: userProfile,
};

const failureObj = {
  error: {
    message: "You are not authenticated",
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
  ) as jest.Mock;

describe("Render EditProfileFormWrapper", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() =>
      render(
        <UserProfileContext.Provider
          value={{ userProfile: userProfile, setUserProfile: () => {} }}
        >
          <EditProfileFormWrapper></EditProfileFormWrapper>
        </UserProfileContext.Provider>
      )
    );
  });

  test("Test failure onsubmit 401", async () => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((string: string) => string));
    const displayNameInput = screen.getByTestId("edt-prfl-displayname");
    const bioInput = screen.getByTestId("edt-prfl-bio");
    const button = screen.getByTestId("edt-prfl-sbmt-btn");
    expect(button).toBeDefined();
    await user.type(displayNameInput, "ABC");
    await user.type(bioInput, "ABC");
    await user.click(button);

    await user.click(button);
    expect(console.log).toHaveBeenCalledWith(failureObj.error.message);
  });

  test("Test success onsubmit", async () => {
    jest
      .spyOn(console, "log")
      .mockImplementation(jest.fn((string: string) => string));
    const displayNameInput = screen.getByTestId("edt-prfl-displayname");
    const bioInput = screen.getByTestId("edt-prfl-bio");
    const button = screen.getByTestId("edt-prfl-sbmt-btn");
    expect(button).toBeDefined();
    await user.type(displayNameInput, "ABC");
    await user.type(bioInput, "ABC");
    await user.click(button);

    await user.click(button);
    expect(console.log).toHaveBeenCalledWith(userProfile);
  });
});
