import UserProfileProvider from "@/components/UserProfileProvider";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { UserProfile } from "../../@types/user";
import React, { act } from "react";
import { UserContext } from "@/contexts/user";
import LobbyNavWrapper from "@/components/LobbyNavWrapper";

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
  message: "Successfully retrieved user profile",
  userProfile,
};

const failedObj = {
  message: "Failed to retrieve user profile",
  error: {
    mesage: "Somthing wen wrong",
  },
};

global.fetch = jest
  .fn()
  .mockImplementationOnce(
    jest.fn(() => {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve().then(() => successObj),
      });
    })
  )
  .mockImplementationOnce(
    jest.fn(() => {
      return Promise.resolve({
        status: 400,
        json: () => Promise.resolve().then(() => failedObj),
      });
    })
  )
  .mockImplementationOnce(
    jest.fn(() => {
      return Promise.resolve().then(() => {
        throw new TypeError("Network Error");
      });
    })
  ) as jest.Mock;

describe("Test UserProfileProvider", () => {
  // const user = userEvent.setup();
  beforeEach(async () => {
    jest.spyOn(console, "log").mockImplementation(jest.fn(() => {}));
    await act(() =>
      render(
        <div data-testid="wrapper" className="w-full h-full">
          <UserContext value={{ user: { id: "1" }, setUser: () => {} }}>
            <UserProfileProvider>
              <LobbyNavWrapper />
            </UserProfileProvider>
          </UserContext>
        </div>
      )
    );
  });

  test("Fetch user profile if user exists", () => {
    const username = screen.getByTestId("username");
    expect(username).toBeInTheDocument();
    expect(username.textContent).toBe(`@${userProfile.username}`);
  });

  test("Run error handler on if response status >= 400", () => {
    expect(console.log).toHaveBeenCalledWith(failedObj.message);
  });

  test("Run caught error handler", () => {
    expect(console.log).toHaveBeenCalledWith("Network Error");
  });
});
