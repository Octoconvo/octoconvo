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

describe("Test Active modal provider", () => {
  const user = userEvent.setup();
  beforeEach(() => {
    render(
      <div data-testid="wrapper" className="w-full h-full">
        <UserProfileContext.Provider
          value={{ userProfile, setUserProfile: jest.fn(() => {}) }}
        >
          <ActiveModalProvider>
            <div data-testid="not-modal"></div>
            <LobbyNavWrapper />
          </ActiveModalProvider>
        </UserProfileContext.Provider>
      </div>
    );
  });

  test("Profile modal is not visible", () => {
    const ProfileModal = screen.queryByTestId("profile-modal");
    expect(ProfileModal?.className).toContain("hidden");
  });

  test("Profile modal is Active", async () => {
    const ProfileModal = screen.queryByTestId("profile-modal");
    const profileBtn = screen.queryByTestId("profile-btn") as HTMLButtonElement;
    expect(profileBtn).toBeInTheDocument();
    await user.click(profileBtn);
    expect(ProfileModal?.className).not.toContain("hidden");
  });

  test("Active modal is closed on Escape keydown", async () => {
    const ProfileModal = screen.queryByTestId("profile-modal");
    const profileBtn = screen.queryByTestId("profile-btn") as HTMLButtonElement;
    expect(profileBtn).toBeInTheDocument();
    await user.click(profileBtn);
    expect(ProfileModal?.className).not.toContain("hidden");
    await user.keyboard("{Escape}");
    expect(ProfileModal?.className).toContain("hidden");
  });

  test("Active modal is closed when clicking outside its boundary", async () => {
    const notModal = screen.getByTestId("not-modal");
    const ProfileModal = screen.queryByTestId("profile-modal");
    const profileBtn = screen.queryByTestId("profile-btn") as HTMLButtonElement;
    expect(profileBtn).toBeInTheDocument();
    await user.click(profileBtn);
    expect(ProfileModal?.className).not.toContain("hidden");
    await user.click(notModal);
    expect(ProfileModal?.className).toContain("hidden");
  });
});
