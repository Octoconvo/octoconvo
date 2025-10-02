import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import FriendItem from "@/components/friends/FriendItem";
import { UserFriendMock } from "@/utils/tests/mocks";
import testIds from "@/utils/tests/testIds";

const usernameMock = "testusername";
const displayNameMock = "testdisplayName";
const userFriendMock = new UserFriendMock({
  username: usernameMock,
  displayName: displayNameMock,
});

describe("Test FriendItem component", () => {
  beforeEach(() => {
    render(<FriendItem friend={userFriendMock} />);
  });

  test("username shoud be testusername", () => {
    expect(screen.getByTestId(testIds.friendItemUsername).textContent).toBe(
      "@" + usernameMock
    );
  });

  test("username shoud be testusername", () => {
    expect(screen.getByTestId(testIds.friendItemDisplayName).textContent).toBe(
      displayNameMock
    );
  });
});
