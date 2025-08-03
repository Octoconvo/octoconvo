import { screen, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NotificationRequestItem from "@/components/Notification/NotificationRequestItem";
import { NotificationGET } from "@/types/response";

const notification: NotificationGET = {
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

const updateNotificationMock = jest.fn(() => {});

global.fetch = jest.fn(() =>
  Promise.resolve().then(() => ({
    status: 200,
    json: () =>
      Promise.resolve({
        message: "Successfully updated the notification",
        notification: notification,
      }),
  }))
) as jest.Mock;

describe("Render NotificationRequestIem", () => {
  const user = userEvent.setup();

  test("render the correct notification message", async () => {
    await act(async () =>
      render(
        <NotificationRequestItem
          notification={notification}
          updateNotification={updateNotificationMock}
        />
      )
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
            updateNotification={updateNotificationMock}
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
        render(
          <NotificationRequestItem
            notification={notification}
            updateNotification={updateNotificationMock}
          />
        )
      );
      const item = screen.getByTestId("ntfctn-rqst-itm");

      expect(item.classList).toContain("bg-brand-1-2");
    }
  );

  test(
    "Render button list if the notification request's status is" + " pending",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={notification}
            updateNotification={updateNotificationMock}
          />
        )
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
        render(
          <NotificationRequestItem
            notification={notification}
            updateNotification={updateNotificationMock}
          />
        )
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
            updateNotification={updateNotificationMock}
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
            updateNotification={updateNotificationMock}
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
            updateNotification={updateNotificationMock}
          />
        )
      );

      const buttonList = screen.queryByTestId("ntfctn-rqst-itm-btn-ls");

      expect(buttonList).not.toBeInTheDocument();
    }
  );

  test(
    "Test the accept request button onSubmit function with a 200" +
      "  success response",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, status: "PENDING" }}
            updateNotification={updateNotificationMock}
          />
        )
      );

      const buttons = screen.getAllByTestId("ntfctn-rqst-actn-btn");
      const acceptBtn = buttons.find(
        (btn) => btn.textContent?.toLowerCase() === "accept"
      ) as HTMLButtonElement;

      expect(updateNotificationMock).toHaveBeenCalledTimes(0);
      await user.click(acceptBtn);
      expect(updateNotificationMock).toHaveBeenCalledTimes(1);
    }
  );

  test(
    "Test the accept request button onSubmit function with a 200" +
      " success response",
    async () => {
      await act(async () =>
        render(
          <NotificationRequestItem
            notification={{ ...notification, status: "PENDING" }}
            updateNotification={updateNotificationMock}
          />
        )
      );

      const buttons = screen.getAllByTestId("ntfctn-rqst-actn-btn");
      const acceptBtn = buttons.find(
        (btn) => btn.textContent?.toLowerCase() === "reject"
      ) as HTMLButtonElement;

      updateNotificationMock.mockClear();
      expect(updateNotificationMock).toHaveBeenCalledTimes(0);
      await user.click(acceptBtn);
      expect(updateNotificationMock).toHaveBeenCalledTimes(1);
    }
  );
});
