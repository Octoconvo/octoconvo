import LobbyNav from "@/components/LobbyNav";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Render LobbyNav component", () => {
  beforeEach(() => {
    render(<LobbyNav />);
  });

  it("Friends nav link exists", () => {
    const loginLink = screen.getByTestId("friends-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/friends");
  });

  it("DM nav link exists", () => {
    const loginLink = screen.getByTestId("dm-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/dm");
  });

  it("Communities nav link exists", () => {
    const loginLink = screen.getByTestId("communities-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/communities");
  });

  it("Create communityk nav link exists", () => {
    const loginLink = screen.getByTestId(
      "create-community-l"
    ) as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/community/create");
  });

  it("Explore nav link exists", () => {
    const loginLink = screen.getByTestId("explore-l") as HTMLAnchorElement;
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.href).toContain("/explore");
  });
});
