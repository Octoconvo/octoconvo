import { closeOnOutsideClick, createHTMLNewLine } from "@/utils/HTMLUtils";
import { FC, useRef } from "react";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("Test createHTMLNewLine", async () => {
  const element = createHTMLNewLine(
    "newlinetest1\nnewlinetest2\n"
  ) as React.JSX.Element;

  let newlinesCount = 0;

  const countNewLine = async () => {
    const countPromise = element.props.children.map((el: React.JSX.Element) => {
      return new Promise((resolve): void => {
        for (const child of el.props.children) {
          if (child.type === "br") {
            newlinesCount += 1;
          }
        }

        resolve(1);
      });
    });

    await Promise.all(countPromise);
  };

  await countNewLine();

  expect(newlinesCount).toBe(2);
});

const closeModalMock = jest.fn();
const closeControllerMockTestId = "close-controller-mock";
const targetMockTestId = "target-mock";
const targetChildMockTestId = "not-target-mock";

interface ComponentMockProps {
  refElement: boolean;
  mountRef: boolean;
}

const ComponentMock: FC<ComponentMockProps> = ({ refElement, mountRef }) => {
  const ref = useRef<null | HTMLDivElement>(null);

  return (
    <div
      data-testid={closeControllerMockTestId}
      onClick={(e) => {
        closeOnOutsideClick({
          e,
          ref: refElement ? ref : null,
          closeModal: closeModalMock,
        });
      }}
    >
      <div data-testid={targetMockTestId} ref={mountRef ? ref : null}>
        <div data-testid={targetChildMockTestId}></div>
      </div>
    </div>
  );
};

describe("Test closeOnOutsideClick function", () => {
  const user = userEvent.setup();

  test("Don't close the element if ref is null", async () => {
    render(<ComponentMock refElement={false} mountRef={true} />);
    const targetMock = screen.getByTestId(targetMockTestId);
    await user.click(targetMock);
    expect(closeModalMock).toHaveBeenCalledTimes(0);
  });

  test("Don't close the element if ref.current is null", async () => {
    render(<ComponentMock refElement={true} mountRef={false} />);
    const targetMock = screen.getByTestId(targetMockTestId);
    await user.click(targetMock);
    expect(closeModalMock).toHaveBeenCalledTimes(0);
  });

  test("Don't close the element if target is equal to ref element", async () => {
    render(<ComponentMock refElement={true} mountRef={true} />);
    const targetMock = screen.getByTestId(targetMockTestId);
    await user.click(targetMock);
    expect(closeModalMock).toHaveBeenCalledTimes(0);
  });

  test("Don't close the element if target is ref element's child", async () => {
    render(<ComponentMock refElement={true} mountRef={true} />);
    const targetChild = screen.getByTestId(targetChildMockTestId);
    await user.click(targetChild);
    expect(closeModalMock).toHaveBeenCalledTimes(0);
  });

  test("Close the element if clicking outside it", async () => {
    render(<ComponentMock refElement={true} mountRef={true} />);
    const closeControllerMock = screen.getByTestId(closeControllerMockTestId);
    await user.click(closeControllerMock);
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });
});
