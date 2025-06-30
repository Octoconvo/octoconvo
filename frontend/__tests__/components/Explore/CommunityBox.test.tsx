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
  const user = userEvent.setup();

  test(
    "Render infinite scroll next observer" + " if infiniteScrollData is not",
    () => {
      render(
        <CommunityBox
          Communities={communities}
          infiniteScrollData={{
            nextCursor: false,
            currentQuery: "",
            updateData: jest.fn(),
          }}
        />
      );

      const observerNext = screen.getByTestId("obsrvr-nxt");
      expect(observerNext).toBeInTheDocument();
    }
  );

  test(
    "Don't render infinite scroll next observer" +
      " if infiniteScrollData is false",
    () => {
      render(
        <CommunityBox Communities={communities} infiniteScrollData={false} />
      );

      const observerNext = screen.queryByTestId("obsrvr-nxt");
      expect(observerNext).not.toBeInTheDocument();
    }
  );

  test(
    "Render infinite scroll next observer" +
      " if infiniteScrollData is not false",
    () => {
      render(
        <CommunityBox
          Communities={communities}
          infiniteScrollData={{
            nextCursor: false,
            currentQuery: "",
            updateData: jest.fn(),
          }}
        />
      );

      const observerNext = screen.getByTestId("obsrvr-nxt");
      expect(observerNext).toBeInTheDocument();
    }
  );
});
