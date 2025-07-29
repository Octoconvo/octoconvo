import { screen, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NotificationRequestItem from "@/components/Notification/NotificationRequestItem";
import { NotificationRequest } from "@/types/notification";

const notification: NotificationRequest = {
  id: "testnotification1",
  triggeredById: "testnotification1",
  triggeredBy: {
    username: "testnotification1",
  },
  triggeredForId: "testnotification1",
  triggeredFor: {
    username: "testnotification1",
  },
  isRead: false,
  createdAt: "testnotification1",
  type: "COMMUNITYREQUEST",
  status: "PENDING",
  payload: "requested to join",
  communityId: "testnotification1",
  community: {
    name: "testnotification1",
  },
};

describe("Render NotificationRequestIem", () => {
  const user = userEvent.setup();

  test("render the correct notification message", async () => {
    await act(async () =>
      render(<NotificationRequestItem notification={notification} />)
    );

    const userUsername = screen.getByTestId("ntfctn-rqst-itm-msg-usr-usrnm");
    const payload = screen.getByTestId("ntfctn-rqst-itm-msg-pyld");
    const communityName = screen.getByTestId("ntfctn-rqst-itm-msg-cmmnty-nm");

    expect(userUsername.textContent).toBe(notification.triggeredBy.username);
    expect(payload.textContent).toBe(" " + notification.payload + " ");
    expect(communityName.textContent).toBe(notification.community?.name);
  });

  test(
    "Render the correct style when the notification isRead" + " is true",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, isRead: true }}
          />
        )
      );
      const item = screen.getByTestId("ntfctn-rqst-itm");

      expect(item.classList).toContain("bg-gr-black-1-b");
    }
  );

  test(
    "Render the correct style when the notification isRead" + " is false",
    async () => {
      await act(async () =>
        render(<NotificationRequestItem notification={notification} />)
      );
      const item = screen.getByTestId("ntfctn-rqst-itm");

      expect(item.classList).toContain("bg-brand-1-2");
    }
  );

  test(
    "Render button list if the notification request's status is" + " pending",
    async () => {
      await act(async () =>
        render(<NotificationRequestItem notification={notification} />)
      );

      const buttonList = screen.getByTestId("ntfctn-rqst-itm-btn-lst");

      expect(buttonList).toBeInTheDocument();
    }
  );

  test(
    "Don't render notification request's update if the notification" +
      " request's status is pending",
    async () => {
      await act(async () =>
        render(<NotificationRequestItem notification={notification} />)
      );

      const statusUpdate = screen.queryByTestId("ntfctn-rqst-itm-sts-updt");

      expect(statusUpdate).not.toBeInTheDocument();
    }
  );

  test(
    "Render notification request's update if the notification" +
      " request's status is rejected",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, status: "REJECTED" }}
          />
        )
      );

      const statusUpdate = screen.getByTestId("ntfctn-rqst-itm-sts-updt");

      expect(statusUpdate).toBeInTheDocument();
      expect(statusUpdate.textContent).toBe("Rejected");
    }
  );

  test(
    "Render notification request's update if the notification" +
      " request's status is accepted",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, status: "ACCEPTED" }}
          />
        )
      );

      const statusUpdate = screen.getByTestId("ntfctn-rqst-itm-sts-updt");

      expect(statusUpdate).toBeInTheDocument();
      expect(statusUpdate.textContent).toBe("Accepted");
    }
  );

  test(
    "Don't render button list if the notification request's status" +
      " is not pending",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, status: "ACCEPTED" }}
          />
        )
      );

      const buttonList = screen.queryByTestId("ntfctn-rqst-itm-btn-ls");

      expect(buttonList).not.toBeInTheDocument();
    }
  );
});
