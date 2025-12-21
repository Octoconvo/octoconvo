import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DirectMessageList from "@/components/DirectMessages/DirectMessageList";
import { generateDirectMessageMock } from "@/mocks/API/directMessage";
import { DirectMessageAPI } from "@/types/api";

const directMessages: DirectMessageAPI[] = generateDirectMessageMock(10);

describe("Render MessageList component", () => {
  test(
    "Render 10 direct messages component when the directMessages.length is" +
      " 10",
    () => {
      render(<DirectMessageList directMessages={directMessages} />);
      const lists = screen.getAllByRole("listitem");
      expect(lists.length).toBe(10);
    }
  );

  test(
    "Render zero message information when the directMessages.length is" + " 0",
    () => {
      render(<DirectMessageList directMessages={[]} />);
      const message = screen.getByText("No messages yet.");
      expect(message).toBeDefined();
    }
  );
});
