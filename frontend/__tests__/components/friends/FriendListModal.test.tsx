import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import FriendListModal from "@/components/friends/FriendListModal";
import testIds from "@/utils/tests/testIds";
import QueryProvider from "@/components/QueryProvider";
import { FriendListModalContext } from "@/contexts/modal";
import { FC, useRef } from "react";
import {
  createFetchMock,
  generateUserFriendMocks,
  UserFriendMock,
} from "@/utils/tests/mocks";
import { ConfigMock, GetData, ResponseMock } from "@/types/tests/mocks";
import { Counter } from "@/utils/tests/helpers";

const friendsMock = generateUserFriendMocks(10);
const counter = new Counter();

interface UserFriendResponse {
  message: string;
  friends: UserFriendMock[];
}

const getData: GetData<UserFriendResponse> = <Data,>(
  url?: string,
  config?: ConfigMock
) => {
  const friends: Data =
    counter.count === 0 ? (friendsMock as Data) : ([] as Data);

  return {
    status: 200,
    data: {
      message: "Successfully fetched user's friends",
      friends,
    },
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

  return (
    <FriendListModalContext
      value={{
        isInitial,
        isOpen,
        setIsOpen: jest.fn(),
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
  test("The modal should render 10 friends on the ulist", async () => {
    render(<ComponentMock isInitial={true} isOpen={false} />);

    await waitFor(async () => {
      const list = screen.getAllByRole("listitem") as HTMLElement[];
      expect(list.length).toBe(10);
      counter.increment();
    });
  });

  test(
    "The modal should display 'You have no friends yet' if the user has 0" +
      " friends",
    async () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);

      await waitFor(async () => {
        const noFriendsText = screen.getByText("You have no friends yet");
        expect(noFriendsText).toBeInTheDocument;
        counter.increment();
      });
    }
  );

  test(
    "The modal should have display hidden if isInital is true and isOpen is" +
      " false",
    () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      const friendListModal = screen.getByTestId(testIds.friendListModal);
      expect(friendListModal.classList).toContain("hidden");
    }
  );

  test(
    "The modal should not have display hidden if isInital is true and isOpen" +
      " is true",
    () => {
      render(<ComponentMock isInitial={true} isOpen={true} />);
      const friendListModal = screen.getByTestId(
        testIds.friendListModal
      ) as HTMLElement;
      expect(friendListModal.classList).not.toContain("hidden");
    }
  );

  test(
    "The modal should have display hidden if isInital is true and isOpen" +
      " is false",
    () => {
      render(<ComponentMock isInitial={true} isOpen={false} />);
      const friendListModal = screen.getByTestId(
        testIds.friendListModal
      ) as HTMLElement;
      expect(friendListModal.classList).toContain("hidden");
    }
  );

  test(
    "The modal's classList should have z-10 if isOpen is true and the" +
      " animationEnd event is called",
    () => {
      render(<ComponentMock isInitial={true} isOpen={true} />);
      const friendListModal = screen.getByTestId(
        testIds.friendListModal
      ) as HTMLElement;
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
      const friendListModal = screen.getByTestId(
        testIds.friendListModal
      ) as HTMLElement;
      expect(friendListModal.classList).not.toContain("z-0");
      fireEvent.animationEnd(friendListModal);
      expect(friendListModal.classList).toContain("z-0");
    }
  );
});
