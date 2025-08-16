import CommunityBox from "@/components/Explore/CommunityBox";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommunityExploreGET } from "@/types/response";

const communities: CommunityExploreGET[] = [
  {
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
  },
];

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
})) as jest.Mock;

describe("Render CommunityBox", () => {
  beforeEach(() => {
    render(
      <CommunityBox
        communities={communities}
        nextCursor={false}
        nameQuery=""
        updateCommunitiesStates={jest.fn()}
        isInfiniteScrollOn={false}
      />
    );
  });

  test("Render the communities", () => {
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBe(1);
  });
});
