import CreateCommunityForm from "@/components/CreateCommunity/CreateCommunityForm";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { previewFile, selectFile, validateFiles } from "@/utils/file";
import { triggerInputClick } from "@/utils/controller";

const onSubmit = jest.fn();

const imageFile = new File(["a".repeat(1024)], "image-test", {
  type: "image/png",
});

jest.mock("@/utils/file", () => ({
  selectFile: jest.fn(),
  previewFile: jest.fn(),
  validateFiles: jest.fn(() => ["testimage1"]),
  previewImage: jest.fn(() => "buffer:testimagepreviewurl1"),
}));

jest.mock("@/utils/controller", () => ({
  triggerInputClick: jest.fn(),
}));

describe("Render CreateCommunityForm to test selectFile invocation on file selection", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () =>
      render(
        <CreateCommunityForm
          isSubmitting={false}
          onSubmit={onSubmit}
          validationError={[]}
          resetError={() => {}}
        ></CreateCommunityForm>
      )
    );
  });

  it("Update avatar preview after selecting an image", async () => {
    const input = screen.queryByTestId("crt-cmmnty-avatar") as HTMLInputElement;
    expect(input).toBeDefined();

    await user.upload(input, imageFile);

    const avatarPreview = screen.getByTestId(
      "crt-cmmnty-avatar-img"
    ) as HTMLImageElement;
    expect(avatarPreview.src).toContain("testimagepreviewurl1");
  });

  it("Update banner preview after selecting an image", async () => {
    const input = screen.queryByTestId("crt-cmmnty-banner") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    const bannerPreview = screen.getByTestId(
      "crt-cmmnty-banner-img"
    ) as HTMLImageElement;
    expect(bannerPreview.src).toContain("testimagepreviewurl1");
  });

  it("Invoke avatar file input when avatar button is clicked", async () => {
    const button = screen.getByTestId(
      "crt-cmmnty-avatar-btn"
    ) as HTMLButtonElement;
    expect(button).toBeDefined();
    await user.click(button);
    expect(triggerInputClick).toHaveBeenCalled();
  });

  it("Invoke banner file input when banner button is clicked", async () => {
    const button = screen.getByTestId(
      "crt-cmmnty-banner-btn"
    ) as HTMLButtonElement;
    expect(button).toBeDefined();
    await user.click(button);
    expect(triggerInputClick).toHaveBeenCalled();
  });
});

describe("Render CreateCommunityForm to test validationError", () => {
  const user = userEvent.setup();
  const resetError = jest.fn(() => {});
  beforeEach(async () => {
    await act(async () =>
      render(
        <CreateCommunityForm
          isSubmitting={false}
          onSubmit={onSubmit}
          validationError={[
            {
              field: "name",
              msg: "Community name is already taken",
              value: "",
            },
          ]}
          resetError={resetError}
        ></CreateCommunityForm>
      )
    );
  });

  it("Render validation error", async () => {
    const error = screen.getByText(
      "Community name is already taken"
    ) as HTMLDivElement;
    expect(error).toBeDefined();
  });

  it(
    "ResetError is called onInput when validationError is not" + " empty",
    async () => {
      const nameInput = screen.getByTestId("crt-cmmnty-name");

      expect(nameInput).toBeInTheDocument();
      await user.type(nameInput, "A");
      expect(resetError).toHaveBeenCalled();
    }
  );
});
