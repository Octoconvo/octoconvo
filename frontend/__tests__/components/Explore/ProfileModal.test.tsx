import ProfileModal from "@/components/Explore/ProfileModal";
import userEvent from "@testing-library/user-event";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProfileAPI } from "@/types/api";

const profile: ProfileAPI = {
  id: "testprofile1",
  username: "testprofile1",
  displayName: "testprofile1",
  bio: "testprofile1",
  avatar: "buffer:testprofile1",
  banner: "buffer:testprofile1",
  isDeleted: false,
  lastSeen: "2025-03-12T20:09:55.245Z",
  createdAt: "2025-03-12T20:09:55.245Z",
  updatedAt: "2025-03-12T20:09:55.245Z",
};

const onCloseMock = jest.fn();

describe("Render ProfileModal", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() =>
      render(<ProfileModal profile={profile} onClose={onCloseMock} />)
    );
  });

  test("Invoke onClose fn when the user click the Esc key", async () => {
    expect(onCloseMock).toHaveBeenCalledTimes(0);

    await user.keyboard("{Escape}");
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test(
    "Don't invoke onClose fn when the user click" + " inside the profile modal",
    async () => {
      onCloseMock.mockClear();
      expect(onCloseMock).toHaveBeenCalledTimes(0);

      const profileModal = screen.getByTestId("profile-modal");
      await user.click(profileModal);
      expect(onCloseMock).toHaveBeenCalledTimes(0);
    }
  );

  test(
    "Invoke onClose fn when the user click" + " outside the profile modal",
    async () => {
      onCloseMock.mockClear();
      expect(onCloseMock).toHaveBeenCalledTimes(0);

      const profileModalWrapper = screen.getByTestId("profile-modal-wrapper");
      await user.click(profileModalWrapper);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    }
  );
});

describe("Test ProfileModal conditional render", () => {
  test("Render bio if bio is not null", async () => {
    await act(() =>
      render(<ProfileModal profile={profile} onClose={onCloseMock} />)
    );
    const profileModalBio = screen.getByTestId("profile-modal-bio");
    expect(profileModalBio.textContent).toBe("testprofile1");
  });

  test("Render no bio yet if bio is null", async () => {
    await act(() =>
      render(
        <ProfileModal
          profile={{ ...profile, bio: null }}
          onClose={onCloseMock}
        />
      )
    );

    const profileModalBio = screen.getByTestId("profile-modal-bio");
    expect(profileModalBio.textContent).toBe("No bio yet.");
  });

  test("Use avatar url if avatar is not null", async () => {
    await act(() =>
      render(<ProfileModal profile={profile} onClose={onCloseMock} />)
    );

    const profileModalAvatar = screen.getByTestId(
      "profile-modal-avatar"
    ) as HTMLImageElement;
    expect(profileModalAvatar.src).toContain("testprofile1");
  });

  test("Use default avatar if avatar is null", async () => {
    await act(() =>
      render(
        <ProfileModal
          profile={{ ...profile, avatar: null }}
          onClose={onCloseMock}
        />
      )
    );

    const profileModalAvatar = screen.getByTestId(
      "profile-modal-avatar"
    ) as HTMLImageElement;
    expect(profileModalAvatar.src).toContain("images/avatar_icon.svg");
  });
});
