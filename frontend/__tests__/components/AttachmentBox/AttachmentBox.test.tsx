import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Attachment } from "@/types/response";
import AttachmentBox from "@/components/AttachmentBox/AttachmentBox";
import userEvent from "@testing-library/user-event";

const attachmentsMock: Attachment[] = [
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
];

const zoomImageMock = jest.fn(() => {});

describe("Render AttachmentBox to test its functionality", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(
      <AttachmentBox attachments={attachmentsMock} zoomImage={zoomImageMock} />
    );
  });

  test("Render the correct URL", () => {
    // Expect url to be correct
    const image = screen.getByRole("img") as HTMLImageElement;

    expect(image.src).toBe(attachmentsMock[0].thumbnailUrl);
  });

  test("Invoke zoomImage function when clicking the image button", async () => {
    const button = screen.getByRole("button");

    await user.click(button);
    expect(zoomImageMock).toHaveBeenCalled();
  });
});
