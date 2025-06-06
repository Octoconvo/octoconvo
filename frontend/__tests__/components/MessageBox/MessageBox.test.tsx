import MessageBox from "@/components/MessageBox/MessageBox";
import { validateFiles } from "@/utils/file";
import "@testing-library/jest-dom";
import { render, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/utils/file", () => ({
  previewImage: jest.fn(() => "blob: testpreviewurl"),
  validateFiles: jest.fn(() => {}),
}));

global.fetch = jest.fn().mockImplementationOnce(
  jest.fn(
    (
      //eslint-disable-next-line
      _url
    ) =>
      Promise.resolve().then(() => ({
        status: 422,
        json: () =>
          Promise.resolve({
            error: {
              validationError: [
                {
                  field: "content",
                  value: "",
                  msg: "Message is required",
                },
              ],
            },
          }),
      }))
  )
);

describe("Render MessageBox", () => {
  // Test attachment file selection
  const user = userEvent.setup();

  beforeAll(async () => {
    const originalModule = jest.requireActual("@/utils/file");

    (validateFiles as jest.Mock)
      .mockImplementation(originalModule.validateFiles)
      .mockImplementationOnce(
        jest.fn(() => {
          throw new Error("Invalid mimetype");
        })
      )
      .mockImplementationOnce(
        jest.fn(() => {
          throw new Error("File size is too big");
        })
      );
  });

  test("Show error when attachments mimetype is not allowed", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 2, maxSize: 5000000, totalSize: 5000000 }}
        />
      );
    });

    const attachmentInput = screen.getByTestId("msg-box-attchmnt-input");

    expect(attachmentInput).toBeInTheDocument();
    /* Use accepted mimetype due to userevent upload not emitting onInput when 
    the mimetype is not in the accept attribure */
    const file = new File(["testfile1"], "testfile1.png", {
      type: "image/png",
    });

    // Attchment UList shouldn't be rendered
    const attachmentUList = screen.queryByTestId("fl-err-mdl");
    expect(attachmentUList).not.toBeInTheDocument();

    await user.upload(attachmentInput, file);

    // Error box should be rendered
    const errorModal = screen.getByTestId("fl-err-mdl");
    expect(errorModal).toBeInTheDocument();

    const heading = screen.getByText("Invalid file type");
    expect(heading).toBeInTheDocument();
  });

  test("Show error when attachments exceeds maxSize", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 2, maxSize: 5000000, totalSize: 5000000 }}
        />
      );
    });

    const attachmentInput = screen.getByTestId("msg-box-attchmnt-input");

    expect(attachmentInput).toBeInTheDocument();
    const file = new File(["testfile1"], "testfile1.png", {
      type: "image/png",
    });

    // Attchment UList shouldn't be rendered
    const attachmentUList = screen.queryByTestId("fl-err-mdl");
    expect(attachmentUList).not.toBeInTheDocument();

    await user.upload(attachmentInput, file);

    // Error box should be rendered
    const errorModal = screen.getByTestId("fl-err-mdl");
    expect(errorModal).toBeInTheDocument();

    const heading = screen.getByText("File size is too big");
    expect(heading).toBeInTheDocument();
  });

  test("Show error when attachments exceeds maximum number of file limit", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 0, maxSize: 1, totalSize: 5000000 }}
        />
      );
    });

    const attachmentInput = screen.getByTestId("msg-box-attchmnt-input");

    expect(attachmentInput).toBeInTheDocument();
    const file = new File(["testfile1"], "testfile1.png", {
      type: "image/png",
    });

    // Attchment UList shouldn't be rendered
    const attachmentUList = screen.queryByTestId("fl-err-mdl");
    expect(attachmentUList).not.toBeInTheDocument();

    await user.upload(attachmentInput, file);

    // Error box should be rendered
    const errorModal = screen.getByTestId("fl-err-mdl");
    expect(errorModal).toBeInTheDocument();

    const heading = screen.getByText("Too many upload");
    expect(heading).toBeInTheDocument();
  });

  test("Show error when attachments total size is exceeded", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 1, maxSize: 5000000, totalSize: 1 }}
        />
      );
    });

    const attachmentInput = screen.getByTestId("msg-box-attchmnt-input");

    expect(attachmentInput).toBeInTheDocument();
    const file = new File(["testfile1"], "testfile1.png", {
      type: "image/png",
    });

    // Attchment UList shouldn't be rendered
    const attachmentUList = screen.queryByTestId("fl-err-mdl");
    expect(attachmentUList).not.toBeInTheDocument();

    await user.upload(attachmentInput, file);

    // Error box should be rendered
    const errorModal = screen.getByTestId("fl-err-mdl");
    expect(errorModal).toBeInTheDocument();

    const heading = screen.getByText("Total file size is too big");
    expect(heading).toBeInTheDocument();
  });

  test("Successfully render attachment if validation passed", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 2, maxSize: 5000000, totalSize: 5000000 }}
        />
      );
    });

    const attachmentInput = screen.getByTestId(
      "msg-box-attchmnt-input"
    ) as HTMLInputElement;

    expect(attachmentInput).toBeInTheDocument();
    const file = new File(["testfile1"], "testfile1.png", {
      type: "image/png",
    });

    await user.upload(attachmentInput, file);

    // Render image preview when successfully validated and created image preview
    const attachmentUList = screen.getByTestId("msg-box-attchmnt-ulist");
    expect(attachmentUList).toBeInTheDocument();
    expect(attachmentUList.children.length).toBe(1);
  });

  // Test 422 error

  test("Test fetch 422 error response", async () => {
    await act(async () => {
      render(
        <MessageBox
          path="testpath1"
          inboxId="testinboxid1"
          attachment={{ limit: 2, maxSize: 5000000, totalSize: 5000000 }}
        />
      );
    });

    const button = screen.getByRole("button", { name: "Send" });
    const contentTextarea = screen.getByTestId("msg-bx-txtr-cntnt");

    await user.type(contentTextarea, "testmessage1");
    await user.click(button);

    // Show validation error
    expect(screen.getByText("Message is required")).toBeInTheDocument();

    // Reset validation error
    await user.type(contentTextarea, "testmessage2");
    expect(screen.queryByText("Message is required")).not.toBeInTheDocument();
  });
});
