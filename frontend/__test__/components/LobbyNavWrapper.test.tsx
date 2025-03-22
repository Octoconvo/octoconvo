import LobbyNavWrapper from "@/components/LobbyNavWrapper";
import { UserProfileContext } from "@/contexts/user";
import { UserProfile } from "../../@types/user";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ActiveModalProvider from "@/components/ActiveModalProvider";

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

describe("Render LobbyNavWrapper", () => {
  const user = userEvent.setup();
  beforeEach(() => {
    render(
      <div data-testid="wrapper" className="w-full h-full">
        <UserProfileContext.Provider
          value={{ userProfile, setUserProfile: jest.fn(() => {}) }}
        >
          <ActiveModalProvider>
            <LobbyNavWrapper />
          </ActiveModalProvider>
        </UserProfileContext.Provider>
      </div>
    );
  });

  it("Friends nav link exists", async () => {
    const useStateSpy = jest.spyOn(React, "useState");
    const profileButton = screen.getByTestId(
      "profile-btn"
    ) as HTMLButtonElement;
    expect(profileButton).toBeInTheDocument();
    await user.click(profileButton);
    expect(useStateSpy).toHaveBeenCalled();
  });
});
