import useAnimate from "@/hooks/useAnimate";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRef } from "react";

const onAnimateStartMock = jest.fn();
const onAnimateEndMock = jest.fn();
const testId = "component-mock";

const ComponentMock = () => {
  const ref = useRef<null | HTMLDivElement>(null);
  useAnimate({
    ref: ref,
    onAnimateStart: onAnimateStartMock,
    onAnimateEnd: onAnimateEndMock,
  });

  return <div data-testid={`${testId}`} ref={ref}></div>;
};

describe("Test useAnimate hook", () => {
  beforeEach(() => {
    render(<ComponentMock />);
  });

  test("onAnimateStart should be called on 'animateStart' event", () => {
    const div = screen.getByTestId(testId);
    fireEvent.animationStart(div);
    expect(onAnimateStartMock).toHaveBeenCalledTimes(1);
  });

  test("onAnimateEnd should be called on 'animateEnd' event", () => {
    const div = screen.getByTestId(testId);
    fireEvent.animationEnd(div);
    expect(onAnimateEndMock).toHaveBeenCalledTimes(1);
  });
});
