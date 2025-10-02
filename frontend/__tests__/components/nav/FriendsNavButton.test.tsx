import FriendsNavButton from "@/components/nav/FriendsNavButton";
import { FriendListModalContext } from "@/contexts/modal";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

const ComponentMock = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleView = () => {
    setIsOpen(!isOpen);
  };

  return (
    <FriendListModalContext
      value={{
        isInitial: true,
        isOpen,
        modalRef: null,
        setIsOpen: jest.fn(),
        toggleView,
      }}
    >
      <div>
        <p>{isOpen ? "OPEN" : "CLOSED"}</p>
        <FriendsNavButton />
      </div>
    </FriendListModalContext>
  );
};

describe("Test FriendsNavButton", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ComponentMock />);
  });

  test("Update state when the button is clicked", async () => {
    const textMock = screen.getByRole("paragraph");
    const friendNavButton = screen.getByRole("button");
    expect(textMock.textContent).toBe("CLOSED");
    await user.click(friendNavButton);
    expect(textMock.textContent).toBe("OPEN");
  });
});
