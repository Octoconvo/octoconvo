import { screen, render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Payload from "@/components/Notification/Payload";

describe("Render Payload", () => {
  test(
    "Render the triggered for span when the triggeredFor is" + " not null",
    async () => {
      await act(async () =>
        render(
          <Payload
            triggeredBy="testtriggeredBy1"
            payload="testpayload1"
            triggeredFor="testtriggeredFor1"
          />
        )
      );

      const triggeredFor = screen.getByTestId("ntfctn-rqst-itm-msg-trggrdfr");

      expect(triggeredFor.textContent).toBe("testtriggeredFor1");
    }
  );

  test(
    "The triggered for span should not be rendered when the triggeredFor" +
      " is null",
    async () => {
      await act(async () =>
        render(
          <Payload
            triggeredBy="testtriggeredBy1"
            payload="testpayload1"
            triggeredFor={null}
          />
        )
      );

      const triggeredFor = screen.queryByTestId("ntfctn-rqst-itm-msg-trggrdfr");

      expect(triggeredFor).not.toBeInTheDocument();
    }
  );

  test("Render the correct payload data", async () => {
    await act(async () =>
      render(
        <Payload
          triggeredBy="testtriggeredBy1"
          payload="testpayload1"
          triggeredFor="testtriggeredFor1"
        />
      )
    );

    const triggeredBy = screen.getByTestId("ntfctn-rqst-itm-msg-trggrdby");
    const payload = screen.getByTestId("ntfctn-rqst-itm-msg-pyld");
    const triggeredFor = screen.queryByTestId("ntfctn-rqst-itm-msg-trggrdfr");

    expect(triggeredBy.textContent).toBe("testtriggeredBy1");
    expect(payload.textContent).toBe(" testpayload1 ");
    expect(triggeredFor?.textContent).toBe("testtriggeredFor1");
  });
});
