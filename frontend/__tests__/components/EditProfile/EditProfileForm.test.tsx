import EditProfileForm from "@/components/EditProfile/EditProfileForm";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfileContext } from "@/contexts/user";
import { UserProfile } from "@/types/user";
import { previewFile, selectFile } from "@/utils/fileUtils";
import { triggerInputClick } from "@/utils/controllerUtils";

const onSubmit = jest.fn();

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

const imageFile = new File(["a".repeat(1024)], "image-test", {
  type: "image/png",
});

jest.mock("@/utils/fileUtils", () => ({
  selectFile: jest.fn(),
  previewFile: jest.fn(),
}));

jest.mock("@/utils/controllerUtils", () => ({
  triggerInputClick: jest.fn(),
}));

describe("Render EditProfileForm to test selectFile invocation on file selection", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () =>
      render(
        <UserProfileContext.Provider
          value={{ userProfile, setUserProfile: jest.fn() }}
        >
          <EditProfileForm
            isSubmitting={false}
            onSubmit={onSubmit}
          ></EditProfileForm>
        </UserProfileContext.Provider>
      )
    );
  });

  it("selectFile is invoked on avatar file Input", async () => {
    const input = screen.queryByTestId("edt-prfl-avatar") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(selectFile).toHaveBeenCalled();
  });

  it("selectFile is invoked on banner file Input", async () => {
    const input = screen.queryByTestId("edt-prfl-banner") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(selectFile).toHaveBeenCalled();
  });
});

describe("Render EditProfileForm with userProfile", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () =>
      render(
        <UserProfileContext.Provider
          value={{ userProfile, setUserProfile: jest.fn() }}
        >
          <EditProfileForm
            isSubmitting={false}
            onSubmit={onSubmit}
          ></EditProfileForm>
        </UserProfileContext.Provider>
      )
    );
  });

  it("Render avatar URL as image preview when avatar exists", () => {
    const image = screen.queryByTestId(
      "edt-prfl-avatar-img"
    ) as HTMLImageElement;
    expect(image).toBeDefined();
    expect(image.src).toContain(userProfile.avatar?.replace("https://", ""));
  });

  it("Render banner URL as image preview when banner exists", () => {
    const image = screen.queryByTestId(
      "edt-prfl-banner-img"
    ) as HTMLImageElement;
    expect(image).toBeDefined();
    expect(image.src).toContain(userProfile.banner?.replace("https://", ""));
  });

  it("Render displayname value as input default value when userProfile is not null", () => {
    const input = screen.queryByTestId(
      "edt-prfl-displayname"
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.defaultValue).toBeDefined();
  });

  it("Render bio value as input default value when userProfile is not null", () => {
    const input = screen.queryByTestId("edt-prfl-bio") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.defaultValue).toBeDefined();
  });

  it("Invoke avatar file input when avatar button is clicked", async () => {
    const button = screen.getByTestId(
      "edt-prfl-avatar-btn"
    ) as HTMLButtonElement;
    expect(button).toBeDefined();
    await user.click(button);
    expect(triggerInputClick).toHaveBeenCalled();
  });

  it("Invoke banner file input when banner button is clicked", async () => {
    const button = screen.getByTestId(
      "edt-prfl-banner-btn"
    ) as HTMLButtonElement;
    expect(button).toBeDefined();
    await user.click(button);
    expect(triggerInputClick).toHaveBeenCalled();
  });
});

describe("Render EditProfileForm and reset mock to test previewFile", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    const originalModule = jest.requireActual("@/utils/fileUtils");
    (selectFile as jest.Mock).mockImplementationOnce(originalModule.selectFile);

    await act(async () =>
      render(
        <UserProfileContext.Provider
          value={{ userProfile, setUserProfile: jest.fn() }}
        >
          <EditProfileForm
            isSubmitting={false}
            onSubmit={onSubmit}
          ></EditProfileForm>
        </UserProfileContext.Provider>
      )
    );
  });

  it("previewFile is Invoked when avatar is not null", async () => {
    const input = screen.queryByTestId("edt-prfl-avatar") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(previewFile).toHaveBeenCalled();
  });

  it("previewFile is invoked when banner is not null", async () => {
    const input = screen.queryByTestId("edt-prfl-banner") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(previewFile).toHaveBeenCalled();
  });
});

describe("Render EditProfileForm without userProfile", () => {
  beforeEach(() => {
    render(
      <EditProfileForm
        isSubmitting={false}
        onSubmit={onSubmit}
      ></EditProfileForm>
    );
  });

  it("Avatar img element shouldn't be rendered if userProfile is null", () => {
    const image = screen.queryByTestId(
      "edt-prfl-avatar-img"
    ) as HTMLImageElement;
    expect(image).toBeNull();
  });

  it("Banner img element shouldn't be rendered if userProfile is null", () => {
    const image = screen.queryByTestId(
      "edt-prfl-banner-img"
    ) as HTMLImageElement;
    expect(image).toBeNull();
  });
});
