import SearchBar from "@/components/SearchBar/SearchBar";
import userEvent from "@testing-library/user-event";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const onSubmitFnMock = jest.fn();
const onResetFnMock = jest.fn();
const onSuccessFnMock = jest.fn();

global.fetch = jest.fn().mockImplementation(
  jest.fn(
    (
      //eslint-disable-next-line
      _url
    ) =>
      Promise.resolve().then(() => ({
        status: 200,
        json: () => Promise.resolve({}),
      }))
  )
);

describe("Render SearchBar", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () => {
      render(
        <SearchBar
          onResetFn={onResetFnMock}
          onSubmitFn={onSubmitFnMock}
          onSuccessFn={onSuccessFnMock}
        />
      );
    });
  });

  test("Call onSubmitFnMock after clicking submit", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    expect(onSubmitFnMock).toHaveBeenCalled();
  });

  test("Call onSuccessFnMock on successful fetch", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    expect(onSuccessFnMock).toHaveBeenCalled();
  });

  test("Show client validation error", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    onSubmitFnMock.mockReset();
    await user.click(submitBtn);

    expect(onSubmitFnMock).not.toHaveBeenCalled();

    const error = screen.getByText("Query input is required");
    expect(error).toBeInTheDocument();
  });

  test(
    "Reset query button should not be in the document on" + " initial render",
    async () => {
      const resetBtn = screen.queryByTestId("srchbr-rst-qry-btn");

      expect(resetBtn).not.toBeInTheDocument();
    }
  );

  test("Show reset query button after a successful fetch", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);
    const resetBtn = screen.getByTestId("srchbr-rst-qry-btn");

    expect(resetBtn).toBeInTheDocument();
  });

  test("Reset query on reset query button click", async () => {
    const submitBtn = screen.getByTestId("srchbr-sbmt-btn");
    const nameInput = screen.getByTestId("srchbr-nm-input");

    await user.type(nameInput, "testquery1");
    await user.click(submitBtn);

    const resetBtn = screen.getByTestId("srchbr-rst-qry-btn");

    expect(resetBtn).toBeInTheDocument();
    await user.click(resetBtn);

    expect(onResetFnMock).toHaveBeenCalled();
    expect(screen.queryByTestId("srch-rst-qry-btn")).not.toBeInTheDocument();
  });
});
