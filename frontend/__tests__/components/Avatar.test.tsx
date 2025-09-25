import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Avatar from "@/components/Avatar";
import { createMockURL } from "@/utils/tests/mocks";

const DOMAIN = window.location.origin;
const URLMock = createMockURL("testavatar.com");
const testIdMock = "avatar";
const sizeMock = "64px";

describe("Test Avatar component", () => {
  beforeEach(() => {
    render(<Avatar avatar={URLMock} size={sizeMock} testId={testIdMock} />);
  });

  test("The Avatar img should be testavatar.com", () => {
    const avatarImg = screen.getByTestId(testIdMock) as HTMLImageElement;
    expect(avatarImg.src).toBe(URLMock);
  });

  test(
    "The Avatar img's parent element's CSS style width and min width shoud" +
      " be 64px",
    () => {
      const avatarImg = screen.getByTestId(testIdMock) as HTMLImageElement;
      const avatarParentEl = avatarImg.parentElement;

      expect(avatarParentEl?.classList).toContain(`w-[${sizeMock}]`);
      expect(avatarParentEl?.classList).toContain(`min-w-[${sizeMock}]`);
    }
  );

  test(
    "The Avatar img's parent element's CSS style height and min height shoud" +
      " be 64px",
    () => {
      const avatarImg = screen.getByTestId(testIdMock) as HTMLImageElement;
      const avatarParentEl = avatarImg.parentElement;

      expect(avatarParentEl?.classList).toContain(`h-[${sizeMock}]`);
      expect(avatarParentEl?.classList).toContain(`min-h-[${sizeMock}]`);
    }
  );
});

describe("Test Avatar component conditional render", () => {
  test("The Avatar img should be testavatar.com", () => {
    render(<Avatar avatar={null} size={sizeMock} testId={testIdMock} />);
    const avatarImg = screen.getByTestId(testIdMock) as HTMLImageElement;
    expect(avatarImg.src).toBe(`${DOMAIN}/images/avatar-icon-white.svg`);
  });
});
