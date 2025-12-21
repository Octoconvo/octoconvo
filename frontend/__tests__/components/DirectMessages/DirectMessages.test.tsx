import DirectMessages from "@/components/DirectMessages/DirectMessages";
import { createFetchMock } from "@/utils/tests/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GetData } from "@/types/tests/mocks";
import { generateDirectMessageMock } from "@/mocks/API/directMessage";
import { DirectMessageAPI } from "@/types/api";
import { Counter } from "@/utils/tests/helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import testIds from "@/utils/tests/testIds";

const counter: Counter = new Counter();

const directMessageMock: DirectMessageAPI[] = generateDirectMessageMock(10);

const getDirectMessageData = (number: number): DirectMessageAPI[] => {
  let directMessageData: DirectMessageAPI[];

  switch (number) {
    case 0:
      directMessageData = [];
      break;
    case 1:
      directMessageData = directMessageMock;
      break;
    default:
      directMessageData = [];
  }

  return directMessageData;
};

interface DirectMessageData {
  message: string;
  directMessages: DirectMessageAPI[];
}

const getData: GetData<DirectMessageData> = () => {
  const data: DirectMessageData = {
    message: "Successfully fetched user's DMs",
    directMessages: getDirectMessageData(counter.count),
  };

  return {
    status: counter.count === 0 ? 500 : 200,
    data: data,
    error: counter.count === 0 ? "Network Error" : null,
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
const Wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("Render DirectMessages component", () => {
  beforeEach(() => {
    render(
      <Wrapper>
        <DirectMessages />
      </Wrapper>
    );
  });

  afterEach(() => {
    counter.increment();
  });

  test("Render error message when an error has occured", async () => {
    await waitFor(async () => {
      const errorMsg: HTMLElement = screen.getByText("An error has occured");
      expect(errorMsg).toBeInTheDocument();
    });
  });

  test(
    "Render direct messages after successfully fetched the" + " data",
    async () => {
      await waitFor(async () => {
        const directMessages: HTMLElement[] = screen.getAllByTestId(
          testIds.DMItem
        );
        expect(directMessages.length).toBe(10);
      });
    }
  );
});
