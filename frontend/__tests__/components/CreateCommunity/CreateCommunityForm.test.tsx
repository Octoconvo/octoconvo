import CreateCommunityForm from "@/components/CreateCommunity/CreateCommunityForm";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { previewFile, selectFile } from "@/utils/file";
import { triggerInputClick } from "@/utils/controller";

const onSubmit = jest.fn();

const imageFile = new File(["a".repeat(1024)], "image-test", {
  type: "image/png",
});

jest.mock("@/utils/file", () => ({
  selectFile: jest.fn(),
  previewFile: jest.fn(),
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
        ></CreateCommunityForm>
      )
    );
  });

  it("selectFile is invoked on avatar file Input", async () => {
    const input = screen.queryByTestId("crt-cmmnty-avatar") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(selectFile).toHaveBeenCalled();
  });

  it("selectFile is invoked on banner file Input", async () => {
    const input = screen.queryByTestId("crt-cmmnty-banner") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(selectFile).toHaveBeenCalled();
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
});

describe("Render CreateCommunityProfile and reset mock to test previewFile invocations", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    const originalModule = jest.requireActual("@/utils/file");
    (selectFile as jest.Mock).mockImplementationOnce(originalModule.selectFile);

    await act(async () =>
      render(
        <CreateCommunityForm
          isSubmitting={false}
          onSubmit={onSubmit}
          validationError={[]}
        ></CreateCommunityForm>
      )
    );
  });

  it("previewFile is Invoked when avatar is not null", async () => {
    const input = screen.queryByTestId("crt-cmmnty-avatar") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(previewFile).toHaveBeenCalled();
  });

  it("previewFile is invoked when banner is not null", async () => {
    const input = screen.queryByTestId("crt-cmmnty-banner") as HTMLInputElement;
    expect(input).toBeDefined();
    await user.upload(input, imageFile);
    expect(previewFile).toHaveBeenCalled();
  });
});
