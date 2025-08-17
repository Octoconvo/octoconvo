import CommunitiesItem from "@/components/Communities/CommunitiesList/CommunitiesItem";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { userEvent } from "@testing-library/user-event";
import { CommunityAPI } from "@/types/api";

const communitiesList = [
  {
    id: "1",
    name: "Community_Test_Name",
    bio: "Community_Test_Bio",
    avatar: "http://Community_Test_Avatar",
    banner: null,
    isDeleted: false,
    createdAt: "test",
    updatedAt: "test",
    inbox: {
      id: "1",
      inboxType: "COMMUNITY",
      communityId: "1",
      directMessageId: null,
    },
  },
  {
    id: "2",
    name: "Community_Test_Name_1",
    bio: "Community_Test_Bio_1",
    avatar: null,
    banner: null,
    isDeleted: false,
    createdAt: "test",
    updatedAt: "test",
    inbox: {
      id: "2",
      inboxType: "COMMUNITY",
      communityId: "2",
      directMessageId: null,
    },
  },
] as CommunityAPI[];

jest.mock(
  "next/navigation",
  jest.fn(() => ({
    useParams: jest.fn(() => ({
      communityid: 1,
    })),
  }))
);

describe("Render communitiesList one", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    await act(async () =>
      render(<CommunitiesItem community={communitiesList[0]} />)
    );
  });

  test("Render community name", () => {
    const name = screen.getByText(communitiesList[0].name);

    expect(name).toBeInTheDocument();
  });

  test("Render avatar when it's not null", () => {
    const avatar = screen.getByAltText(communitiesList[0].name + " avatar");

    expect(avatar).toBeInTheDocument();
  });

  test("Test hover style change on community list item", async () => {
    const li = screen.getByTestId("cmmnts-cmmnty-lst");
    const div = screen.getByTestId("cmmnts-cmmnty-lst-avatar-cntnr");
    expect(div.classList).toContain("bg-gr-main-r");

    await user.hover(li);
    expect(div.classList).toContain("bg-black-100");
    expect(div.classList).not.toContain("bg-gr-main-r");
    await user.unhover(li);
    expect(div.classList).not.toContain("bg-black-100");
    expect(div.classList).toContain("bg-gr-main-r");
  });
});

describe("Render communitiesList two", () => {
  beforeEach(async () => {
    render(<CommunitiesItem community={communitiesList[1]} />);
  });

  test("Don't render avatar image when it's null", () => {
    const avatar = screen.queryByAltText(communitiesList[1].name + " avatar");

    expect(avatar).not.toBeInTheDocument();
  });
});
