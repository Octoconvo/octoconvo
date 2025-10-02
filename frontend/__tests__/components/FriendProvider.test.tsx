import FriendProvider from "@/components/FriendProvider";
import { FriendListModalContext } from "@/contexts/modal";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";

const ProviderChildMock = () => {
  const { toggleView, isOpen, isInitial } = useContext(FriendListModalContext);

  return (
    <button onClick={toggleView}>
      {(isOpen ? "OPEN" : "CLOSED") +
        " " +
        (isInitial ? "INITIAL" : "NOTINITIAL")}
    </button>
  );
};

const ComponentMock = () => {
  return (
    <FriendProvider>
      <ProviderChildMock />
    </FriendProvider>
  );
};

describe("Test FriendProvider", () => {
  const user = userEvent.setup();

  beforeAll(() => {
    render(<ComponentMock />);
  });

  test("Test toggleView function", async () => {
    const button = screen.getByRole("button");
    expect(button.textContent).toBe("CLOSED INITIAL");
    await user.click(button);
    expect(button.textContent).toBe("OPEN NOTINITIAL");
  });
});
