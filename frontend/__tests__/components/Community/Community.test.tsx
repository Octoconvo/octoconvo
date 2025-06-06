import Community from "@/components/Community/Community";
import { CommunityResponseGET, InboxMessageGET } from "@/types/response";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserContext } from "@/contexts/user";

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
};
const initialMessage: InboxMessageGET[] = [msg];

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
          json: () =>
            Promise.resolve({
              message: "Successfully fetched Community",
              community,
            }),
        }))
    )
  )
  .mockImplementation(
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
  );

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
})) as jest.Mock;

Element.prototype.scrollTo = () => {};

describe("Render community", () => {
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
});
