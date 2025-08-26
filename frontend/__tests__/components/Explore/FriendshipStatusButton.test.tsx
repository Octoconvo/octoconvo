import FriendshipStatusButton from "@/components/Explore/FriendshipStatusButton";
import { FriendAPI } from "@/types/api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setFriendshipStatusMock = jest.fn();
const friendUsernameMock = "testusername1";

const friend: FriendAPI = {
  status: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  friendOfId: "testfriend1",
  friendId: "testfriend1",
};
const successObj = {
  message: "Successfully fetched data",
  friends: [friend, friend],
};

global.fetch = jest.fn((_url) => {
  return Promise.resolve({
    status: 200,
    json: () => Promise.resolve().then(() => successObj),
  });
}) as jest.Mock;

describe(
  "Render FriendshipStatusButton to test its" + " conditional texts",
  () => {
    test(
      "The button should render 'loading...' when the friendship status" +
        " is null",
      () => {
        render(
          <FriendshipStatusButton
            friendshipStatus={null}
            setFriendshipStatus={setFriendshipStatusMock}
            friendUsername={friendUsernameMock}
          />
        );
        const friendshipStatusButton = screen.getByTestId(
          "friendship-status-btn"
        ) as HTMLButtonElement;
        expect(friendshipStatusButton.textContent).toBe("Loading...");
      }
    );

    test(
      "The button should render 'Requested' when the friendship status" +
        " is 'PENDING'",
      () => {
        render(
          <FriendshipStatusButton
            friendshipStatus={"PENDING"}
            setFriendshipStatus={setFriendshipStatusMock}
            friendUsername={friendUsernameMock}
          />
        );
        const friendshipStatusButton = screen.getByTestId(
          "friendship-status-btn"
        ) as HTMLButtonElement;
        expect(friendshipStatusButton.textContent).toBe("Requested");
      }
    );

    test(
      "The button should render 'Friend' when the friendship status" +
        " is 'ACTIVE'",
      () => {
        render(
          <FriendshipStatusButton
            friendshipStatus={"ACTIVE"}
            setFriendshipStatus={setFriendshipStatusMock}
            friendUsername={friendUsernameMock}
          />
        );
        const friendshipStatusButton = screen.getByTestId(
          "friendship-status-btn"
        ) as HTMLButtonElement;
        expect(friendshipStatusButton.textContent).toBe("Friend");
      }
    );

    test(
      "The button should render 'Add Friend' when the friendship status" +
        " is 'NONE'",
      () => {
        render(
          <FriendshipStatusButton
            friendshipStatus={"NONE"}
            setFriendshipStatus={setFriendshipStatusMock}
            friendUsername={friendUsernameMock}
          />
        );
        const friendshipStatusButton = screen.getByTestId(
          "friendship-status-btn"
        ) as HTMLButtonElement;
        expect(friendshipStatusButton.textContent).toBe("Add Friend");
      }
    );
  }
);
describe("Test FriendshipStatusButton onClick function", () => {
  const user = userEvent.setup();

  test(
    "The onClick function won't proceed is the friendshipStatus is not" +
      " 'NONE'",
    async () => {
      render(
        <FriendshipStatusButton
          friendshipStatus={null}
          setFriendshipStatus={setFriendshipStatusMock}
          friendUsername={friendUsernameMock}
        />
      );
      const friendshipStatusButton = screen.getByTestId(
        "friendship-status-btn"
      ) as HTMLButtonElement;

      await user.click(friendshipStatusButton);
      expect(setFriendshipStatusMock).toHaveBeenCalledTimes(0);
    }
  );

  test("The onClick function proceed if the friendshipStatus is 'NONE'", async () => {
    render(
      <FriendshipStatusButton
        friendshipStatus="NONE"
        setFriendshipStatus={setFriendshipStatusMock}
        friendUsername={friendUsernameMock}
      />
    );
    const friendshipStatusButton = screen.getByTestId(
      "friendship-status-btn"
    ) as HTMLButtonElement;

    await user.click(friendshipStatusButton);
    expect(setFriendshipStatusMock).toHaveBeenCalledTimes(1);
  });
});
