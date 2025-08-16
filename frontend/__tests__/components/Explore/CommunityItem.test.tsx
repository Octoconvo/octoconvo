import CommunityItem from "@/components/Explore/CommunityItem";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommunityExploreGET } from "@/types/api";
import { ActiveExploreCommunity } from "@/contexts/community";

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

const setActiveCommunityMock = jest.fn();

describe("Render CommunityItem", () => {
  const user = userEvent.setup();

  test("Render 'member' when the participants' count is one", () => {
    render(<CommunityItem community={community1} />);

    const participantInfo = screen.getByTestId(
      "cmmnty-itm-prtcpnts"
    ) as HTMLParagraphElement;
    expect(participantInfo.textContent).toBe("1 member");
  });

  test("Render 'members' when the participants' count is not one", () => {
    render(
      <CommunityItem
        community={{
          ...community1,
          _count: {
            participants: 2,
          },
        }}
      />
    );

    const participantInfo = screen.getByTestId(
      "cmmnty-itm-prtcpnts"
    ) as HTMLParagraphElement;
    expect(participantInfo.textContent).toBe("2 members");
  });

  test("Call setActiveCommunity when clicking the community item", async () => {
    render(
      <ActiveExploreCommunity
        value={{
          activeCommunity: null,
          setActiveCommunity: setActiveCommunityMock,
        }}
      >
        <CommunityItem
          community={{
            ...community1,
            _count: {
              participants: 2,
            },
          }}
        />
      </ActiveExploreCommunity>
    );

    const communityItemBtn = screen.getByTestId("xplr-cmmnty-itm-btn");

    await user.click(communityItemBtn);

    expect(setActiveCommunityMock).toHaveBeenCalledTimes(1);
  });
});
