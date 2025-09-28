import NotificationProvider from "@/components/NotificationProvider";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/user";
import { NotificationAPI } from "@/types/api";
import LobbyNavWrapper from "@/components/Lobby/LobbyNavWrapper";
import userEvent from "@testing-library/user-event";
import NotificationModal from "@/components/Notification/NotificationModal";
import QueryProvider from "@/components/QueryProvider";

const successObj = {
  message: "Successfully fetched user's unread notification count",
  unreadNotificationCount: 1,
};

const notification: NotificationAPI = {
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
  payload: "request to join",
  type: "COMMUNITYREQUEST",
  status: "PENDING",
  createdAt: "testnotification1",
  communityId: "testnotification1",
  community: {
    name: "testnotification1",
  },
};

const response = {
  "update-read-status": {
    message: "Successfully fetch the notifications",
    notifications: [{ ...notification, isRead: true }],
  },
  "unread-count": successObj,
  notifications: {
    message: "Successfully fetch the notifications",
    notifications: [notification],
    nextCursor: false,
  },
};

global.fetch = jest.fn().mockImplementation(
  jest.fn((_url: string) => {
    const path = _url.split("/");
    type ValidPath = "update-read-status" | "unread-count" | "notifications";
    const validPath = ["update-read-status", "unread-count", "notifications"];
    const lastPath = path[path.length - 1].split("?")[0];

    if (lastPath === "update-read-status") {
      response["unread-count"].unreadNotificationCount += 1;
    }

    const data = validPath.includes(lastPath)
      ? response[lastPath as ValidPath]
      : {};

    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve().then(() => data),
    });
  })
);

describe("Test NotificationProvider", () => {
  const user = userEvent.setup();
  test("Do not fetch unread notification count if user is null", async () => {
    await act(() =>
      render(
        <QueryProvider>
          <NotificationProvider>
            <NotificationModal />
          </NotificationProvider>
        </QueryProvider>
      )
    );

    const unreadNotificationIndicator = screen.queryByTestId(
      "nrd-ntfctn-cnt-indicator"
    );
    expect(unreadNotificationIndicator).not.toBeInTheDocument();
  });

  test("Fetch unread notification count if user is not null", async () => {
    await act(() =>
      render(
        <QueryProvider>
          <UserContext
            value={{
              user: {
                id: "1",
              },
              setUser: jest.fn(),
            }}
          >
            <NotificationProvider>
              <LobbyNavWrapper />
            </NotificationProvider>
          </UserContext>
        </QueryProvider>
      )
    );

    const notificationBtn = screen.getByTestId("notification-l");
    await user.click(notificationBtn);
    const unreadNotificationIndicator = screen.queryByTestId(
      "nrd-ntfctn-cnt-indicator"
    );
    await waitFor(async () => {
      expect(unreadNotificationIndicator).toBeInTheDocument();
    });
  });
});

describe("Test NotificationProvider notifications buffer", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
        <QueryProvider>
          <UserContext
            value={{
              user: {
                id: "1",
              },
              setUser: jest.fn(),
            }}
          >
            <NotificationProvider>
              <LobbyNavWrapper />
            </NotificationProvider>
          </UserContext>
        </QueryProvider>
      )
    );
  });

  const user = userEvent.setup();

  test(
    "Do not update notificationCount if the notification modal is still" +
      "  open",
    async () => {
      const notificationBtn = screen.getByTestId("notification-l");

      // Open notification modal
      await user.click(notificationBtn);
      const notificationCount = screen.getByTestId("ntfctn-cnt-indicator");
      expect(notificationCount.textContent).toBe("1");
    }
  );

  test(
    " Update notificationCount if the notification modal is" + " closed",
    async () => {
      const notificationBtn = screen.getByTestId("notification-l");
      const notificationCount = screen.getByTestId("ntfctn-cnt-indicator");

      // Open notification modal
      await user.click(notificationBtn);
      // close notification modal
      await user.click(notificationBtn);
      await waitFor(() => expect(notificationCount.textContent).toBe("1"));
    }
  );

  test(
    "Render initial notifications after the notification" + " modal is opened",
    async () => {
      const notificationBtn = screen.getByTestId("notification-l");

      expect(notificationBtn).toBeInTheDocument();
      await user.click(notificationBtn);
      const requestItems = screen.getAllByTestId("ntfctn-rqst-itm");
      expect(requestItems.length).toBe(1);
    }
  );

  test(
    "Do not push buffered notifications if the notification modal is still" +
      "  open",
    async () => {
      const notificationBtn = screen.getByTestId("notification-l");

      // Open notification modal
      await user.click(notificationBtn);

      const requestItems = screen.getAllByTestId("ntfctn-rqst-itm");
      requestItems.forEach((item) => {
        expect(item.classList).toContain("bg-brand-1-2");
      });
    }
  );

  test(
    "Push buffered notifications if the notification modal is" + " closed",
    async () => {
      const notificationBtn = screen.getByTestId("notification-l");

      // open notification modal
      await user.click(notificationBtn);

      const requestItems = screen.getAllByTestId("ntfctn-rqst-itm");
      requestItems.forEach((item) => {
        expect(item.classList).toContain("bg-brand-1-2");
      });

      // close notification modal
      await user.click(notificationBtn);

      await waitFor(async () => {
        const requestItems = screen.getAllByTestId("ntfctn-rqst-itm");
        requestItems.forEach((item) => {
          expect(item.classList).toContain("bg-gr-black-1-b");
        });
      });
    }
  );
});
