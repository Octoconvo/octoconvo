import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import useCloseOnEscape from "@/hooks/useCloseOnEscape";
import userEvent from "@testing-library/user-event";

const closeModalMock = jest.fn();

const ComponentMock = () => {
  useCloseOnEscape({
    closeModal: closeModalMock,
  });

  return <></>;
};

describe("Test useCloseOnEscape hook", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ComponentMock />);
  });

  test("Invoke closeModal function on Escape keydown", async () => {
    expect(closeModalMock).toHaveBeenCalledTimes(0);
    await user.keyboard("{Escape}");
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });
});
