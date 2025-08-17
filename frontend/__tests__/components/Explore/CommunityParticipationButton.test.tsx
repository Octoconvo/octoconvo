import CommunityParticipationButton from "@/components/Explore/CommunityParticipationButton";
import userEvent from "@testing-library/user-event";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ParticipantAPI } from "@/types/api";

const participant1: ParticipantAPI = {
  id: "testparticipant1",
  userId: "testparticipant1",
  role: "MEMBER",
  status: "PENDING",
  communityId: "testparticipant1",
  directMessageId: null,
  createdAt: "testparticipant1",
  updatedAt: "testparticipant1",
  memberSince: null,
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
            participant: participant1,
          }),
      }))
  )
);

type ParticipationStatus = null | "NONE" | "PENDING" | "ACTIVE";

let participationStatusMock: ParticipationStatus = "NONE";
const setParticipationStatusMock = jest.fn((text: ParticipationStatus) => {
  participationStatusMock = text;
}) as jest.Mock;

describe("Render CommunityModal to test the button text", () => {
  test(
    "Participation render 'loading...' when user participation" +
      " is null in the community",
    async () => {
      await act(() =>
        render(
          <CommunityParticipationButton
            communityId="testcommunity1"
            participationStatus={null}
            setParticipationStatus={setParticipationStatusMock}
          />
        )
      );

      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Loading...");
    }
  );

  test(
    "Participation button render 'Join' when user participation" +
      " is NONE in the community",
    async () => {
      await act(() =>
        render(
          <CommunityParticipationButton
            communityId="1"
            participationStatus="NONE"
            setParticipationStatus={setParticipationStatusMock}
          />
        )
      );

      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Join");
    }
  );

  test(
    "Participation button render 'Requested' when user participation" +
      " is PENDING in the community",
    async () => {
      await act(() =>
        render(
          <CommunityParticipationButton
            communityId="1"
            participationStatus="PENDING"
            setParticipationStatus={setParticipationStatusMock}
          />
        )
      );

      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Requested");
    }
  );

  test(
    "Participation button render 'Join' when user participation" +
      " is ACTIVE in the community",
    async () => {
      await act(() =>
        render(
          <CommunityParticipationButton
            communityId="1"
            participationStatus="ACTIVE"
            setParticipationStatus={setParticipationStatusMock}
          />
        )
      );
      const participationBtn = screen.getByTestId(
        "xplr-cmmnty-mdl-prtcptn-btn"
      );

      expect(participationBtn.textContent).toBe("Joined");
    }
  );
});

describe("Render CommunityModal to the button's onClick function", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(() =>
      render(
        <CommunityParticipationButton
          communityId="testcommunity1"
          participationStatus={participationStatusMock}
          setParticipationStatus={setParticipationStatusMock}
        />
      )
    );
  });

  test("Update community participation status after a successful join request", async () => {
    const CommunityParticipationButton = screen.getByTestId(
      "xplr-cmmnty-mdl-prtcptn-btn"
    );

    await user.click(CommunityParticipationButton);

    expect(setParticipationStatusMock).toHaveBeenCalledTimes(1);
    expect(participationStatusMock).toBe("PENDING");
  });
});
