import NotificationNav from "@/components/Lobby/NotificationNav";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  NotificationContext,
  NotificationCountContext,
} from "@/contexts/notification";
import { NotificationModalContext } from "@/contexts/modal";
import userEvent from "@testing-library/user-event";
import { NotificationAPI } from "@/types/api";

jest.mock(
  "next/navigation",
  jest.fn(() => ({
    usePathname: jest
      .fn((): null | string => null)
      .mockImplementationOnce(() => "testpath1/explore")
      .mockImplementationOnce(() => "testpath1/notexplore"),
  }))
);

global.fetch = jest.fn().mockImplementationOnce(
  jest.fn(() =>
    Promise.resolve().then(() => ({
      status: 200,
      json: () =>
        Promise.resolve({
          message: "Success",
          notifications: [],
        }),
    }))
  )
);

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
  payload: "requested to join",
  type: "COMMUNITYREQUEST",
  status: "PENDING",
  createdAt: "testnotification1",
  communityId: "testnotification1",
  community: {
    name: "testnotification1",
  },
};

const toggleNotificationModalViewMock = jest.fn(() => {});
const setBufferedNotificationMock = jest.fn(() => {});
const setNotificationsMock = jest.fn(() => {});

describe("Render NotificationNav", () => {
  const user = userEvent.setup();
  test(
    "Render the notification indicator if the notificaionCount context" +
      " is bigger than 0",
    () => {
      render(
        <NotificationContext
          value={{
            notifications: null,
            setNotifications: jest.fn(),
            bufferedNotifications: [],
            setBufferedNotifications: jest.fn(),
          }}
        >
          <NotificationCountContext
            value={{ notificationCount: 1, setNotificationCount: jest.fn() }}
          >
            <NotificationNav />
          </NotificationCountContext>
        </NotificationContext>
      );

      const notificationCountIndicator = screen.getByTestId(
        "nrd-ntfctn-cnt-indicator"
      );
      expect(notificationCountIndicator).toBeInTheDocument();
    }
  );

  test("Render the correct notification count", () => {
    render(
      <NotificationContext
        value={{
          notifications: null,
          setNotifications: jest.fn(),
          bufferedNotifications: [],
          setBufferedNotifications: jest.fn(),
        }}
      >
        <NotificationCountContext
          value={{ notificationCount: 2, setNotificationCount: jest.fn() }}
        >
          <NotificationNav />
        </NotificationCountContext>
      </NotificationContext>
    );

    const notificationCountIndicator = screen.getByTestId(
      "nrd-ntfctn-cnt-indicator"
    );
    expect(notificationCountIndicator.textContent).toBe("2");
  });

  test(
    "The notification count indicator should not be rendered if" +
      " the notificationCount context is null",
    () => {
      render(<NotificationNav />);

      const notificationCountIndicator = screen.queryByTestId(
        "nrd-ntfctn-cnt-indicator"
      );
      expect(notificationCountIndicator).not.toBeInTheDocument();
    }
  );

  test(
    "The notification count indicator should not be rendered if" +
      " the notificationCount context is 0",
    () => {
      render(
        <NotificationContext
          value={{
            notifications: null,
            setNotifications: jest.fn(),
            bufferedNotifications: [],
            setBufferedNotifications: jest.fn(),
          }}
        >
          <NotificationCountContext
            value={{ notificationCount: 0, setNotificationCount: jest.fn() }}
          >
            <NotificationNav />
          </NotificationCountContext>
        </NotificationContext>
      );

      const notificationCountIndicator = screen.queryByTestId(
        "nrd-ntfctn-cnt-indicator"
      );
      expect(notificationCountIndicator).not.toBeInTheDocument();
    }
  );

  test("Test NotificationNav button's onClick fn", async () => {
    await act(async () =>
      render(
        <NotificationModalContext
          value={{
            notificationModal: null,
            isNotificationModalAnimating: false,
            setIsNotificationModalAnimating: jest.fn(),
            isNotificationModalOpen: false,
            setIsNotificationModalOpen: jest.fn(),
            toggleNotificationModalView: toggleNotificationModalViewMock,
          }}
        >
          <NotificationContext
            value={{
              notifications: null,
              setNotifications: jest.fn(),
              bufferedNotifications: [],
              setBufferedNotifications: jest.fn(),
            }}
          >
            <NotificationCountContext
              value={{ notificationCount: 0, setNotificationCount: jest.fn() }}
            >
              <NotificationNav />
            </NotificationCountContext>
          </NotificationContext>
        </NotificationModalContext>
      )
    );

    expect(toggleNotificationModalViewMock).toHaveBeenCalledTimes(0);

    const notificationNavBtn = screen.getByTestId("notification-l");
    await user.click(notificationNavBtn);

    expect(toggleNotificationModalViewMock).toHaveBeenCalledTimes(1);
  });

  test("Don't Update the notificationBuffer if notification is empty", async () => {
    await act(async () =>
      render(
        <NotificationModalContext
          value={{
            notificationModal: null,
            isNotificationModalAnimating: false,
            setIsNotificationModalAnimating: jest.fn(),
            isNotificationModalOpen: false,
            setIsNotificationModalOpen: jest.fn(),
            toggleNotificationModalView: toggleNotificationModalViewMock,
          }}
        >
          <NotificationContext
            value={{
              notifications: [],
              setNotifications: setNotificationsMock,
              bufferedNotifications: [],
              setBufferedNotifications: setBufferedNotificationMock,
            }}
          >
            <NotificationCountContext
              value={{ notificationCount: 0, setNotificationCount: jest.fn() }}
            >
              <NotificationNav />
            </NotificationCountContext>
          </NotificationContext>
        </NotificationModalContext>
      )
    );

    const notificationNavBtn = screen.getByTestId("notification-l");
    // Open notification modal
    await user.click(notificationNavBtn);
    expect(setBufferedNotificationMock).toHaveBeenCalledTimes(0);
  });

  test(
    "Don't Update the notificationsBuffer if the notification is" + " null",
    async () => {
      await act(async () =>
        render(
          <NotificationModalContext
            value={{
              notificationModal: null,
              isNotificationModalAnimating: false,
              setIsNotificationModalAnimating: jest.fn(),
              isNotificationModalOpen: false,
              setIsNotificationModalOpen: jest.fn(),
              toggleNotificationModalView: toggleNotificationModalViewMock,
            }}
          >
            <NotificationContext
              value={{
                notifications: null,
                setNotifications: setNotificationsMock,
                bufferedNotifications: [notification],
                setBufferedNotifications: setBufferedNotificationMock,
              }}
            >
              <NotificationCountContext
                value={{
                  notificationCount: 0,
                  setNotificationCount: jest.fn(),
                }}
              >
                <NotificationNav />
              </NotificationCountContext>
            </NotificationContext>
          </NotificationModalContext>
        )
      );

      const notificationNavBtn = screen.getByTestId("notification-l");
      // Open notification modal
      await user.click(notificationNavBtn);
      expect(setBufferedNotificationMock).toHaveBeenCalledTimes(0);
    }
  );

  test(
    "Update the bufferednotifications if the bufferedNotifications is not" +
      " empty and the notifications is not null",
    async () => {
      await act(async () =>
        render(
          <NotificationModalContext
            value={{
              notificationModal: null,
              isNotificationModalAnimating: false,
              setIsNotificationModalAnimating: jest.fn(),
              isNotificationModalOpen: false,
              setIsNotificationModalOpen: jest.fn(),
              toggleNotificationModalView: toggleNotificationModalViewMock,
            }}
          >
            <NotificationContext
              value={{
                notifications: [notification],
                setNotifications: setNotificationsMock,
                bufferedNotifications: [notification],
                setBufferedNotifications: setBufferedNotificationMock,
              }}
            >
              <NotificationCountContext
                value={{
                  notificationCount: 0,
                  setNotificationCount: jest.fn(),
                }}
              >
                <NotificationNav />
              </NotificationCountContext>
            </NotificationContext>
          </NotificationModalContext>
        )
      );

      const notificationNavBtn = screen.getByTestId("notification-l");
      await user.click(notificationNavBtn);
      expect(setBufferedNotificationMock).toHaveBeenCalledTimes(1);
    }
  );
});
