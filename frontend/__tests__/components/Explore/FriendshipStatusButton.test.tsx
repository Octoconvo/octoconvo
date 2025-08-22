import FriendshipStatusButton from "@/components/Explore/FriendshipStatusButton";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";

describe(
  "Render FriendshipStatusButton to test its" + " conditional texts",
  () => {
    test(
      "The button should render 'loading...' when the friendship status" +
        " is null",
      () => {
        render(<FriendshipStatusButton friendshipStatus={null} />);
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
        render(<FriendshipStatusButton friendshipStatus={"PENDING"} />);
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
        render(<FriendshipStatusButton friendshipStatus={"ACTIVE"} />);
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
        render(<FriendshipStatusButton friendshipStatus={"NONE"} />);
        const friendshipStatusButton = screen.getByTestId(
          "friendship-status-btn"
        ) as HTMLButtonElement;
        expect(friendshipStatusButton.textContent).toBe("Add Friend");
      }
    );
  }
);
