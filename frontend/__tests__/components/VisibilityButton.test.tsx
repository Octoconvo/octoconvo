import VisibilityButton from "@/components/VisibilityButton";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("render VisibilityButton component", () => {
  const user = userEvent.setup();

  it("Check whether visibility button properly toggle isVisible state", async () => {
    let isVisible = false;
    const setIsVisible = jest.fn((val) => {
      isVisible = val;
    });
    render(
      <VisibilityButton isVisible={isVisible} setIsVisible={setIsVisible} />
    );
    const visibilityButton = screen.getByTestId("visibility-button");
    expect(visibilityButton).toBeInTheDocument();
    expect(isVisible).toBeFalsy();

    await user.click(visibilityButton);
    expect(setIsVisible).toHaveBeenCalledTimes(1);
    expect(isVisible).toBeTruthy();
  });

  it("Check whether visibility icon className contains visibility-off-icon when visibility is false", async () => {
    let isVisible = false;
    const setIsVisible = jest.fn((val) => {
      isVisible = val;
    });
    render(
      <VisibilityButton isVisible={isVisible} setIsVisible={setIsVisible} />
    );

    const visibilityButtonIcon = screen.getByTestId("icon");
    expect(isVisible).toBeFalsy();
    expect(visibilityButtonIcon.classList[0]).toContain("visibility-off-icon");
  });

  it("Check whether visibility icon className contains visibility-on-icon when visibility is true", async () => {
    let isVisible = true;
    const setIsVisible = jest.fn((val) => {
      isVisible = val;
    });
    render(
      <VisibilityButton isVisible={isVisible} setIsVisible={setIsVisible} />
    );

    const visibilityButtonIcon = screen.getByTestId("icon");
    expect(isVisible).toBeTruthy();
    expect(visibilityButtonIcon.classList[0]).toContain("visibility-on-icon");
  });
});
