import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FriendListModal from "@/components/friends/FriendListModal";
import testIds from "@/utils/tests/testIds";
import QueryProvider from "@/components/QueryProvider";
import { FriendListModalContext } from "@/contexts/modal";
import { FC, useRef, useState } from "react";
import {
  createFetchMock,
  generateUserFriendMocks,
  UserFriendMock,
} from "@/utils/tests/mocks";
import { ConfigMock, GetData, ResponseMock } from "@/types/tests/mocks";
import { Counter } from "@/utils/tests/helpers";
import userEvent from "@testing-library/user-event";

const friendsMock = generateUserFriendMocks(10);
const nextCursorMock = friendsMock[friendsMock.length - 1].friend.username;
const counter = new Counter();

interface UserFriendResponse {
  message: string;
  friends: UserFriendMock[];
  nextCursor: string;
}

const getFriendsData = (index: number) => {
  let friendData: UserFriendMock[];

  switch (index) {
    case 0:
      friendData = [];
      break;
    case 1:
    case 2:
      friendData = friendsMock;
      break;
    default:
      friendData = [];
  }

  return friendData;
};

const getData: GetData<UserFriendResponse> = (
  url?: string,
  config?: ConfigMock
) => {
  const data: UserFriendResponse = {
    message: "Successfully fetched user's friends",
    friends: getFriendsData(counter.count),
    nextCursor: counter.count > 1 ? "false" : nextCursorMock,
  };

  return {
    status: 200,
    data,
    error: null,
  };
};

const responseMock: ResponseMock<UserFriendResponse> = {
  getData: getData,
};

global.fetch = createFetchMock(responseMock);

interface ComponentMock {
  isOpen: boolean;
  isInitial: boolean;
}

const ComponentMock: FC<ComponentMock> = ({ isOpen, isInitial }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpenMock, setIsOpenMock] = useState<boolean>(isOpen);

  return (
    <FriendListModalContext
      value={{
        isInitial,
        isOpen: isOpenMock,
        setIsOpen: setIsOpenMock,
        toggleView: jest.fn(),
        modalRef,
      }}
    >
      <QueryProvider>
        <FriendListModal />
      </QueryProvider>
    </FriendListModalContext>
  );
};

describe("Test FriendListModal component", () => {
  const user = userEvent.setup();

  test(
    "The modal should display 'You have no friends yet' if the user has 0" +
      " friends",
    async () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      await waitFor(async () => {
        const noFriendsText = screen.getByText("You have no friends yet");
        expect(noFriendsText).toBeInTheDocument();
        counter.increment();
      });
    }
  );

  test("The modal should render 10 friends on the ulist", async () => {
    render(<ComponentMock isInitial={true} isOpen={false} />);
    await waitFor(async () => {
      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(10);
    });
  });

  const testIsModalHidden = () => {
    const friendListModal = screen.getByTestId(testIds.friendListModal);
    expect(friendListModal.classList).toContain("hidden");
  };

  const testIsModalShown = () => {
    const friendListModal = screen.getByTestId(testIds.friendListModal);
    expect(friendListModal.classList).not.toContain("hidden");
  };

  test(
    "The modal should have display hidden if isInital is true and isOpen is" +
      " false",
    () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      testIsModalHidden();
    }
  );

  test(
    "The modal should not have display hidden if isInital is true and isOpen" +
      " is true",
    () => {
      render(<ComponentMock isInitial={true} isOpen={true} />);
      testIsModalShown();
    }
  );

  test(
    "The modal should have display hidden if isInital is true and isOpen" +
      " is false",
    () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      testIsModalHidden();
    }
  );

  test(
    "The modal's classList should have z-10 if isOpen is true and the" +
      " animationEnd event is called",
    () => {
      render(<ComponentMock isInitial={true} isOpen={true} />);
      const friendListModal = screen.getByTestId(testIds.friendListModal);
      expect(friendListModal.classList).not.toContain("z-10");
      fireEvent.animationEnd(friendListModal);
      expect(friendListModal.classList).toContain("z-10");
    }
  );

  test(
    "The modal's classList should have z-0 if isOpen is false and the" +
      " animationEnd event is calledd",
    () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      const friendListModal = screen.getByTestId(testIds.friendListModal);
      expect(friendListModal.classList).not.toContain("z-0");
      fireEvent.animationEnd(friendListModal);
      expect(friendListModal.classList).toContain("z-0");
    }
  );

  const testInfiniteLoader = async (before: number, after: number) => {
    render(<ComponentMock isInitial={true} isOpen={true} />);
    const lists = screen.getAllByRole("listitem");
    expect(lists.length).toBe(before);
    const infiniteLoader = screen.queryByTestId(
      testIds.friendListModalInfiniteLoader
    );

    counter.increment();

    if (infiniteLoader) {
      await waitFor(async () => {
        fireEvent.mouseEnter(infiniteLoader);
        const friendListItems = screen.getAllByRole("listitem");
        expect(friendListItems.length).toBe(after);
      });
    }
  };

  test("Load more friends if nextCursor is defined", async () => {
    await testInfiniteLoader(10, 20);
  });

  test("Don't loead more friends if nextCursor is undefined", async () => {
    await testInfiniteLoader(20, 20);
  });

  test("The friendListModal should be closed after pressing the Escape key", async () => {
    render(<ComponentMock isInitial={true} isOpen={true} />);
    testIsModalShown();
    await user.keyboard("{Escape}");
    await waitFor(async () => {
      testIsModalHidden();
    });
  });

  test(
    "The friendListModal should be closed after clicking outside of the" +
      " modal",
    async () => {
      render(<ComponentMock isInitial={true} isOpen={true} />);
      const controller = screen.getByTestId(
        testIds.FriendListModalCloseController
      );
      testIsModalShown();
      await user.click(controller);
      await waitFor(async () => {
        testIsModalHidden();
      });
    }
  );
});
