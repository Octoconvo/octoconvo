import DMMessage from "@/components/DirectMessages/DMMessage";
import MessageMock from "@/mocks/API/message";
import testIds from "@/utils/tests/testIds";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttachmentMock from "@/mocks/API/attachment";
import userEvent from "@testing-library/user-event";
import { randomUUID } from "crypto";
import { UserContext } from "@/contexts/user";

const messageMock: MessageMock = new MessageMock({
  authorDisplayName: "testdisplayName",
  authorUsername: "testusername",
  content: "testmessage",
  attachments: [
    new AttachmentMock({
      subType: "JPEG",
      thumbnailUrl: "testavatarthumbnailurl1",
      url: "testavatarurl1,",
    }),
    new AttachmentMock({
      subType: "JPEG",
      thumbnailUrl: "testavatarthumbnailurl2",
      url: "testavatarurl2,",
    }),
    new AttachmentMock({
      subType: "JPEG",
      thumbnailUrl: "testavatarthumbnailurl3",
      url: "testavatarurl3,",
    }),
  ],
});

const userId = randomUUID();

describe("Render DMMessage component", () => {
  beforeEach(() => {
    render(<DMMessage message={messageMock} />);
  });

  test("Render message's author's displayName", () => {
    const messageAuthorDisplayName = screen.getByTestId(
      testIds.DMMessageAuthorDisplayName
    );
    expect(messageAuthorDisplayName.textContent).toBe(
      messageMock.author.displayName
    );
  });

  test("Render message's content", () => {
    const messageContent = screen.getByTestId(testIds.DMMessageContent);
    expect(messageContent.textContent).toBe(messageMock.content);
  });

  test("Render message's avatar", () => {
    const messageAvatar = screen.getByTestId(testIds.DMMessageAuthorAvatar);
    expect(messageAvatar).toBeInTheDocument();
  });

  test(
    "Render message's attachments when attachments array is not" + " empty",
    () => {
      const attachmentBox = screen.getByTestId(
        "attchmnt-bx-cntnr"
      ) as HTMLUListElement;
      expect(attachmentBox).toBeInTheDocument();
      expect(attachmentBox.children.length).toBe(3);
    }
  );

  describe("Test attachment image preview", () => {
    const user = userEvent.setup();
    test(
      "ZoomedImageModal should not be rendered when no attachment is" +
        " in focus",
      () => {
        const zoomedImageModal = screen.queryByTestId("zmd-img-mdl");
        expect(zoomedImageModal).not.toBeInTheDocument();
      }
    );

    test(
      "ZoomedImageModal should be rendered after clicking an" + " attachment",
      async () => {
        const attachmentButtons = screen.getAllByTestId("attchmnt-bx-btn");
        expect(attachmentButtons.length).toBe(3);
        await user.click(attachmentButtons[0]);
        const zoomedImageModal = screen.getByTestId("zmd-img-mdl");
        expect(zoomedImageModal).toBeInTheDocument();
        const zoomedImage = screen.getByTestId("zmd-img-mdl-img-cntnr")
          .children[0];
        expect(zoomedImage).toHaveAttribute(
          "src",
          messageMock.attachments[0].url
        );
      }
    );

    test("Close zoomedImageModal after clicking the close button", async () => {
      const attachmentButtons = screen.getAllByTestId("attchmnt-bx-btn");
      expect(attachmentButtons.length).toBe(3);
      await user.click(attachmentButtons[0]);
      const zoomedImageModal = screen.getByTestId("zmd-img-mdl");
      expect(zoomedImageModal).toBeInTheDocument();
      const closeBtn = screen.getByTestId("zmd-img-mdl-cls-btn");
      await user.click(closeBtn);
      expect(screen.queryByTestId("zmd-img-mdl")).not.toBeInTheDocument();
    });
  });
});

describe("Test DMMessage component's conditional renders", () => {
  test(
    "AttachmentBox is not rendered if message's attachments is an empty" +
      " array",
    () => {
      const messageMock: MessageMock = new MessageMock({
        authorDisplayName: "testdisplayName",
        authorUsername: "testusername",
        content: "testmessage",
      });
      render(<DMMessage message={messageMock} />);
      const attachmentBox = screen.queryByTestId(
        "attchmnt-bx-cntnr"
      ) as HTMLUListElement;
      expect(attachmentBox).not.toBeInTheDocument();
    }
  );

  test(
    "Render displayName with non-user styling on messages that are not" +
      " written by the user",
    () => {
      const messageMock: MessageMock = new MessageMock({
        authorDisplayName: "testdisplayName",
        authorUsername: "testusername",
        content: "testmessage",
      });
      render(
        <UserContext.Provider
          value={{
            user: {
              id: userId,
            },
            setUser: jest.fn(),
          }}
        >
          <DMMessage message={messageMock} />
        </UserContext.Provider>
      );
      const messageAuthorDisplayName = screen.getByTestId(
        testIds.DMMessageAuthorDisplayName
      );
      expect(messageAuthorDisplayName.className).toContain("text-white-100");
    }
  );

  test(
    "Render displayName with user styling on messages that are" +
      " written by the user",
    () => {
      const messageMock: MessageMock = new MessageMock({
        authorDisplayName: "testdisplayName",
        authorUsername: "testusername",
        content: "testmessage",
        authorId: userId,
      });
      render(
        <UserContext.Provider
          value={{
            user: {
              id: userId,
            },
            setUser: jest.fn(),
          }}
        >
          <DMMessage message={messageMock} />
        </UserContext.Provider>
      );
      const messageAuthorDisplayName = screen.getByTestId(
        testIds.DMMessageAuthorDisplayName
      );
      expect(messageAuthorDisplayName.className).toContain("text-brand-3-d-1");
    }
  );
});
