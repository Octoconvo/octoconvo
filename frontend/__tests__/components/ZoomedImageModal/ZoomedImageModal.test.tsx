import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AttachmentAPI } from "@/types/api";
import ZoomedImageModal from "@/components/ZoomedImageModal/ZoomedImagedModal";
import userEvent from "@testing-library/user-event";

const attachmentsMock: AttachmentAPI[] = [
  {
    id: "1",
    height: 150,
    width: 320,
    url: "blob: https://testurl1",
    thumbnailUrl: "blob: https://testthumbnailurl1",
    type: "IMAGE",
    subType: "PNG",
    messageId: "testmessageid1",
  },
  {
    id: "2",
    height: 240,
    width: 320,
    url: "blob: https://testurl1",
    thumbnailUrl: "blob: https://testthumbnailurl2",
    type: "IMAGE",
    subType: "PNG",
    messageId: "testmessageid2",
  },
  {
    id: "3",
    height: 320,
    width: 240,
    url: "blob: https://testurl3",
    thumbnailUrl: "blob: https://testthumbnailurl3",
    type: "IMAGE",
    subType: "PNG",
    messageId: "testmessageid3",
  },
];

const closeImageMock = jest.fn(() => {});

describe("Render ZoomedImageModal to test its functionality", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(
      <ZoomedImageModal
        image={attachmentsMock[0]}
        closeImage={closeImageMock}
      />
    );
  });
  test("Render the correct URL", () => {
    // Expect url to be correct
    const image = screen.getByRole("img") as HTMLImageElement;

    expect(image.src).toBe(attachmentsMock[0].url);
  });

  test("Invoke Close image when pressing the escape key", async () => {
    await user.keyboard("{Escape}");

    expect(closeImageMock).toHaveBeenCalled();
  });

  test("Invoke Close image when pressing the close button", async () => {
    const closeButton = screen.getByTestId(
      "zmd-img-mdl-cls-btn"
    ) as HTMLButtonElement;

    await user.click(closeButton);

    expect(closeImageMock).toHaveBeenCalledTimes(2);
  });
});

describe("Render ZoomedImageModal to test conditional image aspect ratio classname", () => {
  const user = userEvent.setup();

  test("Render classname of image with width twice bigger than its height", () => {
    render(
      <ZoomedImageModal
        image={attachmentsMock[0]}
        closeImage={closeImageMock}
      />
    );

    const imgContainer = screen.getByTestId("zmd-img-mdl-img-cntnr");

    expect(imgContainer.className).toContain("h-auto");
  });

  test("Render classname of image with width bigger than its height", () => {
    render(
      <ZoomedImageModal
        image={attachmentsMock[1]}
        closeImage={closeImageMock}
      />
    );

    const imgContainer = screen.getByTestId("zmd-img-mdl-img-cntnr");

    expect(imgContainer.className).toContain("h-[min(90%,1080px)]");
  });

  test("Render classname of image with width less than its height", () => {
    render(
      <ZoomedImageModal
        image={attachmentsMock[2]}
        closeImage={closeImageMock}
      />
    );

    const imgContainer = screen.getByTestId("zmd-img-mdl-img-cntnr");

    expect(imgContainer.className).toContain("w-auto");
  });
});
