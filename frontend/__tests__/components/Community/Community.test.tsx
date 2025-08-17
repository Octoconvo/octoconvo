import Community from "@/components/Community/Community";
import { CommunityResponseGET, InboxMessageAPI } from "@/types/api";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/user";
import { AttachmentAPI } from "@/types/api";
import userEvent from "@testing-library/user-event";

const community: CommunityResponseGET = {
  id: "testid1",
  name: "testname1",
  bio: "testbio1",
  avatar: null,
  banner: null,
  isDeleted: false,
  createdAt: "testcreatedat1",
  updatedAt: "testupdatedat1",
  inbox: {
    id: "testid1",
    inboxType: "COMMUNITY",
    communityId: "testcommunity1",
    directMessageId: null,
  },
};

const msg = {
  id: "testid1",
  content: "testmessage1",
  createdAt: "testupdatedat1",
  updatedAt: "testupdatedat1",
  isDeleted: false,
  isRead: false,
  inboxId: "testinboxid1",
  authorId: "testauthorid1",
  author: {
    username: "testusername1",
    displayName: "testusername1",
    avatar: null,
  },
  replyToId: null,
  hiddenFromAuthor: false,
  hiddenFromRecipient: false,
  attachments: [],
};

const attachments: AttachmentAPI[] = [
  {
    id: "1",
    height: 150,
    width: 320,
    url: "blob: https://testurl1",
    thumbnailUrl: "blob: https://testthumbnailurl1",
    type: "IMAGE",
    subType: "PNG",
    messageId: "testmessageid1",
  },
];

const initialMessage: InboxMessageAPI[] = [msg];

global.fetch = jest
  .fn()
  .mockImplementationOnce(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () => {
            return Promise.resolve({
              message: "Successfully fetched Community",
              community,
            });
          },
        }))
    )
  )
  .mockImplementationOnce(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) =>
        Promise.resolve().then(() => ({
          status: 200,
          json: () =>
            Promise.resolve({
              message: "Successfully fetched messages",
              messagesData: initialMessage,
              prevCursor: false,
              nextCursor: false,
            }),
        }))
    )
  )
  .mockImplementation(
    jest.fn(
      (
        //eslint-disable-next-line
        _url
      ) => {
        const isCommunity = _url.includes("community");

        console.log({ _url });

        return Promise.resolve().then(() => ({
          status: 200,
          json: () => {
            return isCommunity
              ? Promise.resolve({
                  message: "Successfully fetched Community",
                  community,
                })
              : Promise.resolve({
                  message: "Successfully fetched messages",
                  messagesData: [{ ...msg, attachments: attachments }],
                  prevCursor: false,
                  nextCursor: false,
                });
          },
        }));
      }
    )
  );

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
})) as jest.Mock;

Element.prototype.scrollTo = () => {};

describe("Render community", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () => {
      render(
        <UserContext value={{ user: { id: "1" }, setUser: jest.fn() }}>
          <Community id="testid1" />
        </UserContext>
      );
    });
  });

  test("Test initial fetch", () => {
    const communityMSGUlist = screen.getByTestId("cmmnty-msgs-ulst");

    expect(communityMSGUlist).toBeInTheDocument();
    expect(communityMSGUlist.children.length).toBe(2);
  });

  // Render attahmentBox when message has attachments
  test("Render AttachmentBox when attachments length is bigger than zero", () => {
    const attachmentBox = screen.getByTestId("attchmnt-bx-cntnr");

    expect(attachmentBox).toBeInTheDocument();
  });

  test("Render ZoomedImageModal after clicking an image attachment", async () => {
    const attachmentImageBtn = screen.getByTestId("attchmnt-bx-btn");

    expect(attachmentImageBtn).toBeInTheDocument();

    await user.click(attachmentImageBtn);
    const zoomedImgModal = screen.getByTestId("zmd-img-mdl");
    expect(zoomedImgModal).toBeInTheDocument();

    // Invoke closeImage function
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("zmd-img-mdl")).not.toBeInTheDocument();
  });
});
