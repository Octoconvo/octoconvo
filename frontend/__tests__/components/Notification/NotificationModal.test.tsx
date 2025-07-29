import NotificationModal from "@/components/Notification/NotificationModal";
import "@testing-library/jest-dom";
import { screen, render, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationGET } from "@/types/response";
import { NotificationModalContext } from "@/contexts/modal";

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
    jest.fn(() =>
      Promise.resolve().then(() => ({
        status: 200,
        json: () =>
          Promise.resolve({
            message: "Successfully fetched user's notifications",
            notifications: [
              notification,
              { ...notification, id: "testnotification2" },
              { ...notification, id: "testnotification3" },
            ],
            nextCursor: false,
          }),
      }))
    )
  );

describe("Render NotficationModal with true isNotificationModalOpen context", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
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
      )
    );
  });

  test(
    "Show empty notifications messaage if the notifications's" + " length is 0",
    () => {
      const emptyNotificationMsg = screen.getByText("No notifications yet");

      expect(emptyNotificationMsg).toBeInTheDocument();
    }
  );

  test(
    "The initial notificications should be fetched and rendered if" +
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
});

describe("Render NotficationModal with false isNotificationModalOpen context", () => {
  test(
    "Show empty notifications messaage if the notifications's" + " length is 0",
    async () => {
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
    }
  );
});
