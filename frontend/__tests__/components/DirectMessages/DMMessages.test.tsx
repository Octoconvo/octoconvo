import DMMessages from "@/components/DirectMessages/DMMessages";
import MessageMock, { generateMessageMock } from "@/mocks/API/message";
import { InboxMessageAPI } from "@/types/api";
import { GetData } from "@/types/tests/mocks";
import { Counter } from "@/utils/tests/helpers";
import { createFetchMock } from "@/utils/tests/mocks";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import testIds from "@/utils/tests/testIds";

jest.mock(
  "next/navigation",
  jest.fn(() => ({
    useParams: jest.fn(() => ({
      directmessageid: 1,
    })),
  }))
);

const counter: Counter = new Counter();
const infiniteLoaderCounter: Counter = new Counter();
const messageMocks: MessageMock[] = generateMessageMock(10);

const getMessagesData = (number: number): InboxMessageAPI[] | undefined => {
  let messagesData: InboxMessageAPI[] | undefined;

  switch (number) {
    case 0:
      messagesData = undefined;
      break;
    case 1:
      messagesData = undefined;
    default:
      messagesData = messageMocks;
  }

  return messagesData;
};

const getStatusData = (number: number): number => {
  let status: number = 200;

  switch (number) {
    case 0:
      status = 500;
      break;
    case 1:
      status = 401;
      break;
    default:
      status = 200;
  }

  return status;
};

const getErrorData = (number: Number): string | null => {
  let error: string | null = null;

  switch (number) {
    case 0:
      error = "Network Error";
      break;
    default:
      error = null;
  }

  return error;
};

interface MessageData {
  message: string;
  messagesData?: InboxMessageAPI[];
  nextCursor: null | string;
}

const getData: GetData<MessageData> = () => {
  const data: MessageData = {
    message: "Successfully fetched DM's messages",
    messagesData: getMessagesData(counter.count),
    nextCursor: infiniteLoaderCounter.count === 0 ? "testnextCursor" : null,
  };

  return {
    status: getStatusData(counter.count),
    data: data,
    error: getErrorData(counter.count),
  };
};

const responseMock = {
  getData: getData,
};

global.fetch = createFetchMock(responseMock);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

Element.prototype.scrollTo = jest.fn();

const Wrapper = ({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Render DirectMessage component", () => {
  beforeEach(() => {
    render(
      <Wrapper queryClient={queryClient}>
        <DMMessages />
      </Wrapper>
    );
  });

  afterEach(() => {
    counter.increment();
  });

  test("Render error message when an arror has occured", async () => {
    await waitFor(async () => {
      const errorMsg: HTMLElement = screen.getByText("Something went wrong!");
      expect(errorMsg).toBeInTheDocument();
    });
  });

  test("Render error message on 401 error", async () => {
    await waitFor(async () => {
      const errorMsg: HTMLElement = screen.getByText("Something went wrong!");
      expect(errorMsg).toBeInTheDocument();
    });
  });

  test(
    "Render direct message after successfully fetched the" + " data",
    async () => {
      await waitFor(async () => {
        const DMMessages: HTMLElement[] = screen.getAllByTestId(
          testIds.DMMessageContent
        );
        expect(DMMessages.length).toBe(10);
      });
    }
  );
});

describe("Test DirectMessage component infiniteLoader", () => {
  beforeEach(() => {
    const queryClient: QueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    act(() =>
      render(
        <Wrapper queryClient={queryClient}>
          <DMMessages />
        </Wrapper>
      )
    );
  });

  afterEach(() => {
    infiniteLoaderCounter.increment();
  });

  test("Load more DM's messages if nextCursor is defined", async () => {
    await waitFor(async () => {
      const DMMessages: HTMLElement[] = screen.getAllByTestId(
        testIds.DMMessageContent
      );
      expect(DMMessages.length).toBe(10);
      const infiniteLoader = screen.getByTestId(
        testIds.DMMessagesInfiniteLoader
      );
      expect(infiniteLoader).toBeInTheDocument();
      await waitFor(async () => {
        fireEvent.mouseEnter(infiniteLoader);
        expect(infiniteLoader).toBeInTheDocument();
        expect(screen.getAllByTestId(testIds.DMMessageContent).length).toBe(20);
      });
    });
  });

  test(
    "Don't render infinite loader component if next cursor is" + " null",
    async () => {
      await waitFor(async () => {
        queryClient.invalidateQueries();
        const DMMessages: HTMLElement[] = screen.getAllByTestId(
          testIds.DMMessageContent
        );
        expect(DMMessages.length).toBe(10);
        const infiniteLoader = screen.queryByTestId(
          testIds.DMMessagesInfiniteLoader
        );
        expect(infiniteLoader).not.toBeInTheDocument();
      });
    }
  );
});
