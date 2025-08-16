import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfileAPI } from "@/types/api";
import ProfileItem from "@/components/Explore/ProfileItem";

const profile: ProfileAPI = {
  id: "testprofile1",
  username: "testprofile1",
  displayName: "testprofile1",
  avatar: "testprofile1",
  bio: "testprofile1",
  banner: "testprofile1",
  isDeleted: false,
  lastSeen: "testprofile1",
  createdAt: "testprofile1",
  updatedAt: "testProfile1",
};

describe("Render ProfileItem", () => {
  beforeEach(() => {
    render(<ProfileItem profile={profile} />);
  });

  test("Render profile username on the profile item", () => {
    const username = screen.getByTestId("profile-item-username");

    expect(username.textContent).toBe("@" + profile.username);
  });

  test("Render profile displayName on the profile item", () => {
    const displayName = screen.getByTestId("profile-item-displayname");

    expect(displayName.textContent).toBe(profile.displayName);
  });

  test("Render profile bio on the profile item when bio is not null", () => {
    const bio = screen.getByTestId("profile-item-bio");

    expect(bio.textContent).toBe(profile.bio);
  });

  test(
    "Render profile avatar on the profile item when avatar is not" + " null",
    () => {
      const avatar = screen.getByTestId(
        "profile-item-avatar"
      ) as HTMLImageElement;

      expect(avatar.src).toContain(profile.avatar);
    }
  );
});

describe("Test conditional render on ProfileItem", () => {
  test(
    "Don't render profile avatar on the profile item when avatar is" + " null",
    () => {
      render(<ProfileItem profile={{ ...profile, avatar: null }} />);

      const avatar = screen.queryByTestId("profile-item-avatar");

      expect(avatar).not.toBeInTheDocument();
    }
  );

  test("Render empty bio message on the profile item wnen bio is null", () => {
    render(<ProfileItem profile={{ ...profile, bio: null }} />);

    const bio = screen.getByTestId("profile-item-bio");

    expect(bio.textContent).toBe("No bio yet");
  });
});
