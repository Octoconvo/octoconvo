import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FriendList from "@/components/friends/FriendList";
import { UserFriendMock, generateUserFriendMocks } from "@/utils/tests/mocks";

const friends: UserFriendMock[] = generateUserFriendMocks(10);

describe("Test friendList component", () => {
  test("Render 10 FriendItem component when friends.length is 10", () => {
    render(<FriendList friends={friends} />);
    const lists = screen.getAllByRole("listitem");
    expect(lists.length).toBe(10);
  });
});
