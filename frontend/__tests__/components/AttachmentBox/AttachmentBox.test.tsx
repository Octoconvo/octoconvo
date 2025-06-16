import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Attachment } from "@/types/response";
import AttachmentBox from "@/components/AttachmentBox/AttachmentBox";
import userEvent from "@testing-library/user-event";

const attachment: Attachment = {
  id: "1",
  height: 150,
  width: 320,
  url: "blob: https://testurl1",
  thumbnailUrl: "blob: https://testthumbnailurl1",
  type: "IMAGE",
  subType: "PNG",
  messageId: "testmessageid1",
};

const attachmentsMock: Attachment[] = [attachment];

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

describe("Render AttachmentBox to test its conditional layout", () => {
  const user = userEvent.setup();

  test("Test one image attachment layout", async () => {
    render(
      <AttachmentBox attachments={attachmentsMock} zoomImage={zoomImageMock} />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    expect(buttons[0].classList).toContain("max-h-full");
    expect(buttons[0].style.aspectRatio).toBeTruthy();
  });

  test("Test two image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[attachment, attachment]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    expect(buttons[0].classList).toContain("aspect-square");
    expect(buttons[1].classList).toContain("aspect-square");
  });

  test("Test three image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[attachment, attachment, attachment]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    expect(buttons[0].classList).toContain("row-span-full");
    expect(buttons[1].classList).toContain("aspect-square");
    expect(buttons[2].classList).toContain("aspect-square");
  });

  test("Test four image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[attachment, attachment, attachment, attachment]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button) => {
      expect(button.classList).toContain("aspect-square");
    });
  });

  test("Test five image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button, index) => {
      if (index < 2) {
        expect(button.classList).toContain("row-span-3");
      } else {
        expect(button.classList).toContain("row-span-2");
      }
    });
  });

  test("Test six image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button) => {
      expect(button.classList).toContain("aspect-square");
    });
  });

  test("Test seven image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button, index) => {
      if (index < 1) {
        expect(button.classList).toContain("col-span-full");
      } else {
        expect(button.classList).toContain("col-span-2");
      }
    });
  });

  test("Test eight image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button, index) => {
      if (index < 2) {
        expect(button.classList).toContain("col-span-3");
      } else {
        expect(button.classList).toContain("row-span-2");
      }
    });
  });

  test("Test nine image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button, index) => {
      expect(button.classList).toContain("aspect-square");
    });
  });

  test("Test ten image attachments layout", async () => {
    render(
      <AttachmentBox
        attachments={[
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
          attachment,
        ]}
        zoomImage={zoomImageMock}
      />
    );

    const buttons = screen.getAllByTestId("attchmnt-bx-btn");

    buttons.forEach((button, index) => {
      if (index < 1) {
        expect(button.classList).toContain("col-span-full");
      } else {
        expect(button.classList).toContain("col-span-2");
      }
    });
  });
});
