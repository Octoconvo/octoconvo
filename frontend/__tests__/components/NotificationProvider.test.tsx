import NotificationProvider from "@/components/NotificationProvider";
import NotificationNav from "@/components/Lobby/NotificationNav";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/user";

const successObj = {
  message: "Successfully fetched user's unread notification count",
  unreadNotificationCount: 1,
};

global.fetch = jest.fn().mockImplementation(
  jest.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve().then(() => successObj),
    })
  )
);

describe("Test NotificationProvider", () => {
  test("Do not fetch unread notification count if user is null", async () => {
    await act(() =>
      render(
        <NotificationProvider>
          <NotificationNav />
        </NotificationProvider>
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
        <UserContext
          value={{
            user: {
              id: "1",
            },
            setUser: jest.fn(),
          }}
        >
          <NotificationProvider>
            <NotificationNav />
          </NotificationProvider>
        </UserContext>
      )
    );

    const unreadNotificationIndicator = screen.queryByTestId(
      "nrd-ntfctn-cnt-indicator"
    );
    expect(unreadNotificationIndicator).toBeInTheDocument();
  });
});
