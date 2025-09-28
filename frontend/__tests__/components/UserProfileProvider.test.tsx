import UserProfileProvider from "@/components/UserProfileProvider";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { UserProfile } from "@/types/user";
import React, { act } from "react";
import { UserContext } from "@/contexts/user";
import LobbyNavWrapper from "@/components/Lobby/LobbyNavWrapper";
import QueryProvider from "@/components/QueryProvider";
import { Counter } from "@/utils/tests/helpers";

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

const counter = new Counter();

global.fetch = jest.fn().mockImplementation(
  jest.fn((url) => {
    const paths: string[] = url ? url.split("/") : [];
    const isProfile =
      paths.includes("profile") && paths.includes(userProfile.id);
    let data = {};
    let status = 200;

    if (counter.count == 0) {
      data = successObj;
    } else if (counter.count == 1) {
      status = 400;
      data = failedObj;
    } else {
      throw new TypeError("Network Error");
    }

    if (isProfile) {
      counter.increment();
    }

    return Promise.resolve({
      status: status,
      json: () => Promise.resolve(data),
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
          <QueryProvider>
            <UserContext
              value={{ user: { id: userProfile.id }, setUser: () => {} }}
            >
              <UserProfileProvider>
                <LobbyNavWrapper />
              </UserProfileProvider>
            </UserContext>
          </QueryProvider>
        </div>
      )
    );
  });

  afterAll(() => {
    counter.reset();
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
