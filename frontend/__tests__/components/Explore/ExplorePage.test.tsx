import ExplorePage from "@/components/Explore/ExplorePage";
import userEvent from "@testing-library/user-event";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommunityExploreGET } from "@/types/response";

const community1: CommunityExploreGET = {
  id: "testid1",
  _count: {
    participants: 1,
  },
  name: "testname1",
  bio: "tastbio1",
  avatar: "testavatar1",
  banner: "testbanner1",
  isDeleted: false,
  createdAt: "testcreatedat1",
  updatedAt: "testupdatedat1",
};

global.fetch = jest.fn().mockImplementation(
  jest.fn(
    (
      //eslint-disable-next-line
      _url
    ) =>
      Promise.resolve().then(() => ({
        status: 200,
        json: () =>
          Promise.resolve({
            communities: [community1],
            cursor: false,
          }),
      }))
  )
);

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
})) as jest.Mock;

describe("Render ExplorePage", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() => render(<ExplorePage />));
  });

  test("Render featured data on page load", () => {
    const communityBox = screen.getByTestId("cmmnty-bx-ulst");

    expect(communityBox).toBeInTheDocument();
  });

  test("Hide explore page navigation on featured data view", () => {
    const explorePageNav = screen.queryByTestId("explr-pg-nav");

    expect(explorePageNav).not.toBeInTheDocument();
  });

  test("Show community view on a successful query", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    const communityNavBtn = screen.getByTestId("explr-pg-cmmnty-btn");
    expect(communityNavBtn).toBeInTheDocument();
    expect(communityNavBtn.classList).toContain("bg-brand-1-2");
  });

  test("Test nav buttons in ExplorePage", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    const communityNavBtn = screen.getByTestId("explr-pg-cmmnty-btn");
    expect(communityNavBtn).toBeInTheDocument();
    expect(communityNavBtn.classList).toContain("bg-brand-1-2");

    const userNavBtn = screen.getByTestId("explr-pg-usr-btn");
    expect(userNavBtn).toBeInTheDocument();

    await user.click(userNavBtn);
    expect(userNavBtn.classList).toContain("bg-brand-1-2");

    await user.click(communityNavBtn);
    expect(communityNavBtn.classList).toContain("bg-brand-1-2");
  });

  test("Reset view after clicking reset query button", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    const communityNavBtn = screen.getByTestId("explr-pg-cmmnty-btn");
    expect(communityNavBtn).toBeInTheDocument();
    expect(communityNavBtn.classList).toContain("bg-brand-1-2");

    // Reset query and go back to the default featured data view
    const resetQueryBtn = screen.getByTestId("srchbr-rst-qry-btn");
    await user.click(resetQueryBtn);
    expect(screen.queryByTestId("explr-pg-cmmnty-btn")).not.toBeInTheDocument();
  });
});
