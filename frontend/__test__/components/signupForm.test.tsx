import SignupForm from "@/components/SignupForm";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {};
  },
}));

describe("Render signup page", () => {
  beforeEach(() => {
    render(<SignupForm />);
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
