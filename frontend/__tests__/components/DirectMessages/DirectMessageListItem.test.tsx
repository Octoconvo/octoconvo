import DirectMessageListItem from "@/components/DirectMessages/DirectMessageListItem";
import { DirectMessageMock } from "@/mocks/API/directMessage";
import { DirectMessageAPI } from "@/types/api";
import testIds from "@/utils/tests/testIds";
import { render, screen } from "@testing-library/react";

const directMessageMock: DirectMessageAPI = new DirectMessageMock({
  username: "username",
  displayName: "displayName",
  avatar: "avatar",
  message: "message",
});

describe("Render DirectMessageListItem component", () => {
  beforeEach(() => {
    render(<DirectMessageListItem DM={directMessageMock} />);
  });

  test("Render DM's recipient's displayName", () => {
    const displayName = screen.getByTestId(testIds.DMItemDisplayName);
    expect(displayName.textContent).toBe(
      directMessageMock.recipient.displayName
    );
  });

  test("Render DM's last message", () => {
    const lastMessage = screen.getByTestId(testIds.DMItemLastMessage);
    expect(lastMessage.textContent).toBe(directMessageMock.lastMessage.content);
  });

  test("Render DM's recipient's avatar", () => {
    const avatar: HTMLImageElement = screen.getByTestId(testIds.DMItemAvatar);
    expect(avatar.src).toContain("avatar");
  });

  test("Render the correct DM's linkr", () => {
    const link: HTMLAnchorElement = screen.getByTestId(testIds.DMItemLink);
    expect(link.href).toContain(
      `/lobby/direct-messages/${directMessageMock.id}`
    );
  });
});
