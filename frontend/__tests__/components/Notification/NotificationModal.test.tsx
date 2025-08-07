import NotificationModal from "@/components/Notification/NotificationModal";
import "@testing-library/jest-dom";
import { screen, render, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationGET } from "@/types/response";
import { NotificationModalContext } from "@/contexts/modal";
import NotificationProvider from "@/components/NotificationProvider";
import {
  NotificationContext,
  NotificationCountContext,
} from "@/contexts/notification";

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
  payload: "requested to join",
  type: "COMMUNITYREQUEST",
  status: "PENDING",
  createdAt: "testnotification1",
  communityId: "testnotification1",
  community: {
    name: "testnotification1",
  },
};

const updatedPayload = "YOU UPDATED THIS NOTIFICATION";

global.fetch = jest
  .fn()
  .mockImplementationOnce(
    jest.fn(() =>
      Promise.resolve().then(() => ({
        status: 400,
        json: () =>
          Promise.resolve({
            message: "Failed to fetch user's notification",
            error: "You are not authenticated",
          }),
      }))
    )
  )
  .mockImplementation(
    jest.fn((_url: string) => {
      const data = _url.split("/").includes("request")
        ? {
            notification: { ...notification, payload: updatedPayload },
          }
        : {
            notifications: [
              notification,
              { ...notification, id: "testnotification2" },
              { ...notification, id: "testnotification3" },
            ],
            nextCursor: false,
          };
      return Promise.resolve().then(() => ({
        status: 200,
        json: () =>
          Promise.resolve({
            message: "Successfully fetched user's notifications",
            ...data,
          }),
      }));
    })
  );

describe(
  "Render NotficationModal with true isNotificationModalOpen" + " context",
  () => {
    beforeEach(async () => {
      await act(async () =>
        render(
          <NotificationProvider>
            <NotificationModalContext
              value={{
                notificationModal: null,
                isNotificationModalOpen: true,
                isNotificationModalAnimating: false,
                toggleNotificationModalView: () => {},
              }}
            >
              <NotificationModal />
            </NotificationModalContext>
          </NotificationProvider>
        )
      );
    });

    const user = userEvent.setup();

    test(
      "Show empty notifications messaage if the notifications's" +
        " length is 0",
      async () => {
        await act(async () =>
          render(
            <NotificationContext
              value={{
                notifications: [],
                setNotifications: jest.fn(),
                bufferedNotifications: [],
                setBufferedNotifications: jest.fn(),
              }}
            >
              <NotificationModalContext
                value={{
                  notificationModal: null,
                  isNotificationModalOpen: true,
                  isNotificationModalAnimating: false,
                  toggleNotificationModalView: () => {},
                }}
              >
                <NotificationCountContext
                  value={{
                    notificationCount: 0,
                    setNotificationCount: jest.fn(),
                  }}
                >
                  <NotificationModal />
                </NotificationCountContext>
              </NotificationModalContext>
            </NotificationContext>
          )
        );

        const emptyNotificationMsg = screen.getByText("No notifications yet");

        expect(emptyNotificationMsg).toBeInTheDocument();
      }
    );

    test(
      "The initial notifications should be fetched and rendered if" +
        " the notification modal is open",
      async () => {
        const uList = screen.getByTestId("ntfctn-mdl-ulst");
        let count = 0;
        for (const child of uList.children) {
          if (child.nodeName === "LI") count += 1;
        }
        expect(count).toBe(3);
      }
    );

    test(
      "Test updateNotification fn on clicking the accept or reject button" +
        " on a community request",
      async () => {
        const requestItems = screen.getAllByTestId("ntfctn-rqst-itm");

        const btn = requestItems[0].querySelector(
          "[data-testid='ntfctn-rqst-actn-btn']"
        ) as HTMLButtonElement;
        await user.click(btn);
        const payloadSpan = requestItems[0].querySelector(
          "[data-testid='ntfctn-rqst-itm-msg-pyld']"
        );

        expect(payloadSpan).toBeInTheDocument();
        expect(payloadSpan?.textContent).toBe(" " + updatedPayload + " ");
      }
    );
  }
);

describe(
  "Render NotficationModal with false isNotificationModalOpen" + " context",
  () => {
    test("Modal should be hidden", async () => {
      await act(async () =>
        render(
          <NotificationModalContext
            value={{
              notificationModal: null,
              isNotificationModalOpen: false,
              isNotificationModalAnimating: false,
              toggleNotificationModalView: () => {},
            }}
          >
            <NotificationModal />
          </NotificationModalContext>
        )
      );

      const notificationModal = screen.getByTestId("ntfctn-mdl");

      expect(notificationModal.classList).toContain("hidden");
    });
  }
);
