import ExplorePage from "@/components/Explore/ExplorePage";
import userEvent from "@testing-library/user-event";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommunityExploreAPI, ProfileAPI } from "@/types/api";
import SearchBar from "@/components/SearchBar/SearchBar";

const community1: CommunityExploreAPI = {
  id: "testid1",
  _count: {
    participants: 1,
  },
  name: "testname1",
  bio: "tastbio1",
  avatar: "testavatar1",
  banner: "testbanner1",
  isDeleted: false,
  createdAt: "2025-03-12T20:09:55.245Z",
  updatedAt: "2025-03-12T20:09:55.245Z",
};

const profile1: ProfileAPI = {
  id: "testprofile1",
  username: "testprofile1",
  displayName: "testprofile1",
  avatar: null,
  bio: null,
  banner: null,
  isDeleted: false,
  lastSeen: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toDateString(),
};

const response = {
  communities: {
    message: "Successfully fetched communities",
    communities: [community1],
    nextCursor: false,
  },
  profiles: {
    message: "Successfully fetched profiles",
    profiles: [profile1],
    nextCursor: false,
  },
};

global.fetch = jest.fn().mockImplementation(
  jest.fn((_url) => {
    const path = _url.split("/");
    const lastPath = path[path.length - 1].split("?")[0];
    type ValidPath = "communities" | "profiles";
    const validPath = ["communities", "profiles"];

    const data = validPath.includes(lastPath)
      ? response[lastPath as ValidPath]
      : {};

    return Promise.resolve().then(() => ({
      status: 200,
      json: () => Promise.resolve(data),
    }));
  })
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

  test("The featured data's length should be 1", () => {
    const communityBox = screen.getByTestId("cmmnty-bx-ulst");
    let communityBoxChildrenListCount = 0;

    for (const child of communityBox.children) {
      if (child.nodeName === "LI") communityBoxChildrenListCount += 1;
    }
    expect(communityBoxChildrenListCount).toBe(1);
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

  test(
    "Don't render community modal when the active community" + " is null",
    async () => {
      const communityModalContainer = screen.queryByTestId(
        "xplr-cmmnty-mdl-cntnr"
      );

      expect(communityModalContainer).not.toBeInTheDocument();
    }
  );

  test(
    "Render community modal when the active community is" + " not null",
    async () => {
      const communityItemBtns = screen.getAllByTestId("xplr-cmmnty-itm-btn");

      expect(communityItemBtns.length).toBeGreaterThan(0);

      await user.click(communityItemBtns[0]);

      const communityModalContainer = screen.queryByTestId(
        "xplr-cmmnty-mdl-cntnr"
      );

      expect(communityModalContainer).toBeInTheDocument();
    }
  );

  test("Close community modal after clicking the Escape key", async () => {
    const communityItemBtns = screen.getAllByTestId("xplr-cmmnty-itm-btn");

    expect(communityItemBtns.length).toBeGreaterThan(0);

    await user.click(communityItemBtns[0]);

    const communityModalContainer = screen.queryByTestId(
      "xplr-cmmnty-mdl-cntnr"
    );

    expect(communityModalContainer).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(
      screen.queryByTestId("xplr-cmmnty-mdl-cntnr")
    ).not.toBeInTheDocument();
  });
});

describe("Test ExplorePage buttons and fetches", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() => render(<ExplorePage />));
  });

  test("Render CommunityBox after successful submit", async () => {
    const nameInput = screen.getByTestId("srchbr-nm-input");
    const searchBtn = screen.getByTestId("srchbr-sbmt-btn");

    await user.type(nameInput, "testname1");
    await user.click(searchBtn);

    const explorePageNav = screen.getByTestId("explr-pg-nav");
    const communityBox = screen.getByTestId("cmmnty-bx-ulst");

    expect(communityBox).toBeInTheDocument();
    expect(explorePageNav).toBeInTheDocument();
  });

  test("Render ProfileBox after clicking user button", async () => {
    const nameInput = screen.getByTestId("srchbr-nm-input");
    const searchBtn = screen.getByTestId("srchbr-sbmt-btn");

    await user.type(nameInput, "testname1");
    await user.click(searchBtn);

    const explorePageUserBtn = screen.getByTestId("explr-pg-usr-btn");
    await user.click(explorePageUserBtn);

    const profileBox = screen.getByTestId("profile-box-ulist");
    expect(profileBox).toBeInTheDocument();
  });

  test("Don't render profile modal if the activeProfile is null", async () => {
    const profileModal = screen.queryByTestId("profileModal");
    expect(profileModal).not.toBeInTheDocument();
  });

  test("Close ProfileModal after pressing the Escape key", async () => {
    const nameInput = screen.getByTestId("srchbr-nm-input");
    const searchBtn = screen.getByTestId("srchbr-sbmt-btn");

    await user.type(nameInput, "testname1");
    await user.click(searchBtn);

    const explorePageUserBtn = screen.getByTestId("explr-pg-usr-btn");
    await user.click(explorePageUserBtn);

    const profileBox = screen.getByTestId("profile-box-ulist");
    expect(profileBox).toBeInTheDocument();

    const openProfileModalBtn = screen.getByTestId("open-profile-modal-btn");
    await user.click(openProfileModalBtn);

    const profileModal = screen.getByTestId("profile-modal");
    expect(profileModal).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(profileModal).not.toBeInTheDocument();
  });
});
