import { render, screen, act, fireEvent } from "@testing-library/react";
import useInfiniteLoader from "@/hooks/useInfiniteLoader";
import "@testing-library/jest-dom";
import { useRef } from "react";

const fetchNextPageMock = jest.fn();

const ComponentMock = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  useInfiniteLoader({
    ref,
    fetchNextPage: fetchNextPageMock,
    threshold: 1,
  });

  return <div ref={ref} data-testid="mock-id"></div>;
};

describe("Test useInfiniteLoader hook", () => {
  beforeEach(async () => {
    await act(async () => render(<ComponentMock />));
  });

  test("fetchNextPage should be called when the element intersects", () => {
    const elMock = screen.getByTestId("mock-id");
    fireEvent.mouseEnter(elMock);
    expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
  });
});
