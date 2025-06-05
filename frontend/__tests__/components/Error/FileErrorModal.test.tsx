import FileErrorModal from "@/components/Error/FileErrorModal";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Render FileErrorModal", () => {
  const user = userEvent.setup();

  const mockResetFileError = jest.fn(() => {});

  const mockFileError = {
    heading: "testfileerrorheading1",
    message: "testfileerrormessage1",
  };

  beforeEach(() => {
    act(() => {
      render(<FileErrorModal fileError={mockFileError} resetFileError={mockResetFileError} />);
    });
  });

  it("Render file error heading and message", async () => {
    const heading = screen.getByText(mockFileError.heading);
    const message = screen.getByText(mockFileError.message);

    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it("Reset file error when on escape key input", async () => {
    await user.keyboard("{Escape}");

    expect(mockResetFileError).toHaveBeenCalled();
  });

  it("Reset file error when clicking outside of the file error modal", async () => {
    const container = screen.getByTestId("fl-err-mdl-cntnr");

    await user.click(container);

    expect(mockResetFileError).toHaveBeenCalled();
  });
});
