import LobbyNav from "@/components/Lobby/LobbyNav";
import { UserProfile } from "@/types/user";
import { UserProfileContext } from "@/contexts/user";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

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

describe("Render LobbyNav component", () => {
  beforeEach(() => {
    render(<LobbyNav />);
  });

  it("Friends nav link exists", () => {
    const loginLink = screen.getByTestId("friends-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
  });

  it("DM nav link exists", () => {
    const loginLink = screen.getByTestId("dm-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/dm");
  });

  it("Communities nav link exists", () => {
    const loginLink = screen.getByTestId("communities-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/communities");
  });

  it("Create community button exists", () => {
    const loginLink = screen.getByTestId(
      "crt-cmmnty-mdl-opn-btn"
    ) as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
  });

  it("Explore nav link exists", () => {
    const loginLink = screen.getByTestId("explore-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/explore");
  });
});

describe("Check avatar conditional src render", () => {
  test("Render default avatar URL if it's null", () => {
    render(<LobbyNav />);
    const btnAvatar = screen.queryByTestId("btn-avatar") as HTMLImageElement;

    expect(btnAvatar).toBeInTheDocument();
    expect(btnAvatar.src).toBeDefined();
  });

  test("Render user profile avatar URL if it's not null", () => {
    render(
      <UserProfileContext.Provider
        value={{ userProfile, setUserProfile: () => {} }}
      >
        <LobbyNav />
      </UserProfileContext.Provider>
    );
    const btnAvatar = screen.queryByTestId("btn-avatar") as HTMLImageElement;

    expect(btnAvatar).toBeInTheDocument();
    expect(btnAvatar.src).toContain("www.fakeavatarurl.com");
  });
});
