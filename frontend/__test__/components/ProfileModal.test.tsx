import ProfileModal from "@/components/ProfileModal";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { UserProfile } from "../../@types/user";
import { act } from "react";

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

type Config = { method: "POST" | "GET" };

// eslint-disable-next-line
global.fetch = jest.fn((_url, config: Config) => {
  return Promise.resolve({
    status: 200,
    json: () => Promise.resolve().then(() => successObj),
  });
}) as jest.Mock;

describe("Render ProfileModal component", () => {
  beforeEach(async () => {
    await act(async () =>
      render(<ProfileModal id="513c920c-3921-48b2-88d7-5b8156b9e6b8" />)
    );
  });

  it("Check whether edit button is rendered", () => {
    const mainButton = screen.getByTestId("main-btn");
    expect(mainButton).toBeInTheDocument();
  });

  it("Check whether display name and username render correct values", () => {
    const displayName = screen.getByTestId("display-name");
    const username = screen.getByTestId("username");

    expect(displayName).toBeDefined();
    expect(username).toBeDefined();
    expect(displayName.textContent).toBe("test_displayname");
    expect(username.textContent).toBe("@test_username");
  });

  it("Render correcct banner URL", () => {
    const banner = screen.getByTestId("banner") as HTMLImageElement;

    expect(banner).toBeDefined();
    expect(banner.src).toContain("fakebannerurl.com");
  });

  it("Render correct avatar URL", () => {
    const avatar = screen.getByTestId("avatar") as HTMLImageElement;

    expect(avatar).toBeDefined();
    expect(avatar.src).toContain("fakeavatarurl.com");
  });

  it("Render correct bio value", () => {
    const bio = screen.getByTestId("bio");

    expect(bio).toBeDefined();
    expect(bio.textContent).toContain("Test bio.");
  });

  it("Render correct member since date value", () => {
    const date = screen.getByTestId("membersince");

    expect(date).toBeDefined();
    expect(date.textContent).toContain("February");
    expect(date.textContent).toContain("2025");
  });
});

describe("Test ProfileModal component errors", () => {
  it("Check response status >= 400 handler", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      // eslint-disable-next-line
      jest.fn((URL, config: Config) =>
        Promise.resolve({
          status: 400,
          json: jest.fn(() =>
            Promise.resolve({
              message: "Failed to get user profile",
              error: {
                message: "user doesn't exist",
              },
            })
          ),
        })
      ) as jest.Mock
    );
    jest.spyOn(console, "log").mockImplementation();
    await act(async () => render(<ProfileModal id="404" />));

    expect(console.log).toHaveBeenCalledWith("Failed to get user profile");
  });

  it("Check caught error handler", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      // eslint-disable-next-line
      jest.fn((URL, config: Config) =>
        Promise.resolve().then(() => {
          throw new Error("Network Error");
        })
      ) as jest.Mock
    );
    jest.spyOn(console, "log").mockImplementation();
    await act(async () => render(<ProfileModal id="500" />));

    expect(console.log).toHaveBeenCalledWith("Network Error");
  });
});

describe("Check ProfileModal conditional elements", () => {
  it("Don't render image element when banner URL is null", () => {
    userProfile.banner = null;

    render(<ProfileModal id="null" />);
    const banner = screen.queryByTestId("banner") as HTMLImageElement;

    expect(banner).toBeNull();
  });

  it("Render default avatar image when avatar is null", () => {
    userProfile.avatar = null;

    render(<ProfileModal id="null" />);
    const avatar = screen.getByTestId("avatar") as HTMLImageElement;

    expect(avatar).toBeDefined();
    expect(avatar.src).toBeDefined();
  });
});
