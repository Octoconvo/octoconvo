import SignupPage from "@/app/signup/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Render signup page", () => {
  beforeEach(() => {
    render(<SignupPage />);
  });

  it("Check whether username input is rendered", async () => {
    const input = screen.getByTestId("username");
    expect(input).toBeInTheDocument();
  });

  it("Check whether password input is rendered", async () => {
    const input = screen.getByTestId("username");
    expect(input).toBeInTheDocument();
  });
});
