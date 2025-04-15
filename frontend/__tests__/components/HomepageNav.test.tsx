import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import HomepageNav from "@/components/HomepageNav";

describe("Render HomepageNav component", () => {
  beforeEach(() => {
    render(<HomepageNav />);
  });

  it("Log in link redirect to log in page", () => {
    const loginLink = screen.getByRole("link", { name: "Log in" });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("Sign up link redirect to sign up page", () => {
    const signupLink = screen.getByRole("link", { name: "Sign up" });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
