import NotificationNav from "@/components/Lobby/NotificationNav";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NotificationCountContext } from "@/contexts/notification";

jest.mock(
  "next/navigation",
  jest.fn(() => ({
    usePathname: jest
      .fn((): null | string => null)
      .mockImplementationOnce(() => "testpath1/explore")
      .mockImplementationOnce(() => "testpath1/notexplore"),
  }))
);

describe("Render NotificationNav", () => {
  test(
    "Render the notification indicator if the notificaionCount context" +
      " is bigger than 0",
    () => {
      render(
        <NotificationCountContext
          value={{ notificationCount: 1, setNotificationCount: jest.fn() }}
        >
          <NotificationNav />
        </NotificationCountContext>
      );

      const notificationCountIndicator = screen.getByTestId(
        "nrd-ntfctn-cnt-indicator"
      );
      expect(notificationCountIndicator).toBeInTheDocument();
    }
  );

  test("Render the correct notification count", () => {
    render(
      <NotificationCountContext
        value={{ notificationCount: 2, setNotificationCount: jest.fn() }}
      >
        <NotificationNav />
      </NotificationCountContext>
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
        <NotificationCountContext
          value={{ notificationCount: 0, setNotificationCount: jest.fn() }}
        >
          <NotificationNav />
        </NotificationCountContext>
      );

      const notificationCountIndicator = screen.queryByTestId(
        "nrd-ntfctn-cnt-indicator"
      );
      expect(notificationCountIndicator).not.toBeInTheDocument();
    }
  );
});
