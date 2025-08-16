import CommunityModal from "@/components/Explore/CommunityModal";
import userEvent from "@testing-library/user-event";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommunityExploreGET } from "@/types/api";
import { on } from "node:stream";

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
  createdAt: "2025-03-12T20:09:55.245Z",
  updatedAt: "2025-03-12T20:09:55.245Z",
};

const onCloseFnMock = jest.fn();

global.fetch = jest
  .fn()
  .mockImplementation(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () =>
            Promise.resolve({
              participationStatus: "ACTIVE",
            }),
        }))
    )
  )
  .mockImplementationOnce(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () =>
            Promise.resolve({
              participationStatus: null,
            }),
        }))
    )
  )
  .mockImplementationOnce(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () =>
            Promise.resolve({
              participationStatus: "NONE",
            }),
        }))
    )
  )
  .mockImplementationOnce(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () =>
            Promise.resolve({
              participationStatus: "PENDING",
            }),
        }))
    )
  );

describe("Render CommunityModal", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() =>
      render(
        <CommunityModal community={community1} onCloseFn={onCloseFnMock} />
      )
    );
  });

  test(
    "Participation render 'loading...' when user participation" +
      " is null in the community",
    () => {
      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Loading...");
    }
  );

  test(
    "Participation button render 'Join' when user participation" +
      " is NONE in the community",
    () => {
      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Join");
    }
  );

  test(
    "Participation button render 'Requested' when user participation" +
      " is PENDING in the community",
    () => {
      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Requested");
    }
  );

  test(
    "Participation button render 'Join' when user participation" +
      " is ACTIVE in the community",
    () => {
      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Joined");
    }
  );

  test("Run onCloseFn after pressing the escape key", async () => {
    await user.keyboard("{Escape}");
    expect(onCloseFnMock).toHaveBeenCalledTimes(1);
  });

  test("Run onCloseFn clicking outside of the community modal", async () => {
    const communityModalContainer = screen.getByTestId("xplr-cmmnty-mdl-cntnr");

    await user.click(communityModalContainer);
    expect(onCloseFnMock).toHaveBeenCalledTimes(2);
  });
});
