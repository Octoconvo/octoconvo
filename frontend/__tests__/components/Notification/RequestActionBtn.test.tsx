import { screen, render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import RequestActionBtn from "@/components/Notification/RequestActionBtn";

const onSubmitMock = jest.fn((action: string) => {});

describe("Render RequestActionBtn with false isRead and REJECT action", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
        <RequestActionBtn
          isRead={false}
          action="REJECT"
          onSubmit={onSubmitMock}
        />
      )
    );
  });

  const user = userEvent.setup();
  test(
    "Call the onSubmit with REJECT as the argument if the action is REJECT" +
      " when the button is clicked",
    async () => {
      const btn = screen.getByTestId("ntfctn-rqst-actn-btn");
      expect(onSubmitMock).toHaveBeenCalledTimes(0);

      await user.click(btn);
      expect(onSubmitMock).toHaveBeenCalledWith("REJECT");
    }
  );
});

describe("Render RequestActionBtn with true isRead and ACCEPT action", () => {
  beforeEach(async () => {
    await act(async () =>
      render(
        <RequestActionBtn
          isRead={true}
          action="ACCEPT"
          onSubmit={onSubmitMock}
        />
      )
    );
  });

  const user = userEvent.setup();
  test(
    "Call the onSubmit with REJECT as the argument if the action is REJECT" +
      " when the button is clicked",
    async () => {
      onSubmitMock.mockClear();
      const btn = screen.getByTestId("ntfctn-rqst-actn-btn");
      expect(onSubmitMock).toHaveBeenCalledTimes(0);

      await user.click(btn);
      expect(onSubmitMock).toHaveBeenCalledWith("ACCEPT");
    }
  );
});
