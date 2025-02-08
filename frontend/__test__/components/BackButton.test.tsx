import BackButton from "@/components/BackButton";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("Render BackButton component", () => {
  const user = userEvent.setup();
  beforeEach(() => {
    render(<BackButton />);
  });

  it("Back button redirect to previous page", async () => {
    const backButton = screen.getByRole("button", { name: "Go back" });
    expect(backButton).toBeInTheDocument();
    const mockNavigation = jest.fn(() => {
      window.history.pushState({}, "", "/1");
      window.history.pushState({}, "", "/2");
    });

    mockNavigation();
    await user.click(backButton);
    expect(window.location.pathname).toContain("/1");
  });
});
