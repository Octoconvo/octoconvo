import ProfileModal from "@/components/ProfileModal";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Render ProfileModal component", () => {
  beforeEach(() => {
    render(<ProfileModal />);
  });

  it("Check whether edit button is rendered", () => {
    const mainButton = screen.getByTestId("main-btn");
    expect(mainButton).toBeInTheDocument();
  });
});
