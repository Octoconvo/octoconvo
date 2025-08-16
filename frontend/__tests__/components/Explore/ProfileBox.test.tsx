import ProfileBox from "@/components/Explore/ProfileBox";
import { render, screen } from "@testing-library/react";
import { ProfileAPI } from "@/types/api";

const profile: ProfileAPI = {
  id: "testprofile1",
  username: "testprofile1",
  displayName: "testprofile1",
  avatar: "testprofile1",
  bio: null,
  banner: null,
  isDeleted: false,
  lastSeen: "testprofile1",
  createdAt: "testprofile1",
  updatedAt: "testprofile1",
};

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
})) as jest.Mock;

describe("Render ProfileBox", () => {
  test("Render the profiles", () => {
    render(
      <ProfileBox
        profiles={[profile]}
        nameQuery=""
        nextCursor={false}
        updateProfilesStates={jest.fn()}
      />
    );

    const lists = screen.getAllByRole("list");
    expect(lists.length).toBe(1);
  });
});
