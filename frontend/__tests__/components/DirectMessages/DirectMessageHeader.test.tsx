import DirectMessageHeader from "@/components/DirectMessages/DirectMessageHeader";
import { createFetchMock } from "@/utils/tests/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Counter } from "@/utils/tests/helpers";
import { DirectMessageAPI } from "@/types/api";
import { DirectMessageMock } from "@/mocks/API/directMessage";
import { GetData } from "@/types/tests/mocks";
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

const directMessageMock: DirectMessageAPI = new DirectMessageMock({
  displayName: "displayName1",
  username: "username1",
  message: "",
});

const getDirectMessageData = (number: Number): DirectMessageAPI | undefined => {
  let directMessageData: DirectMessageAPI | undefined;

  switch (number) {
    case 0:
      directMessageData = undefined;
      break;
    default:
      directMessageData = directMessageMock;
  }

  return directMessageData;
};

interface DirectMessageData {
  message: string;
  directMessage?: DirectMessageAPI;
}

const getData: GetData<DirectMessageData> = () => {
  const data: DirectMessageData = {
    message: "Successfully fetched user's DMs",
    directMessage: getDirectMessageData(counter.count),
  };

  return {
    status: counter.count === 0 ? 500 : 200,
    data: data,
    error: counter.count === 0 ? "Network ERror" : null,
  };
};

const responemock = {
  getData: getData,
};

global.fetch = createFetchMock(responemock);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Render DirectMessage component", () => {
  beforeEach(() => {
    render(
      <Wrapper>
        <DirectMessageHeader />
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

  test(
    "Render direct message after successfully fetched the" + " data",
    async () => {
      await waitFor(async () => {
        const directMessage: HTMLElement = screen.getByTestId(
          testIds.DMInformationItem
        );
        expect(directMessage).toBeInTheDocument();
      });
    }
  );

  test("Render direct message's avatar", async () => {
    await waitFor(async () => {
      const avatar: HTMLElement = screen.getByTestId(
        testIds.DMInformationAvatar
      );
      expect(avatar).toBeInTheDocument();
    });
  });

  test("Render direct message's displayName", async () => {
    await waitFor(async () => {
      const displayName: HTMLElement = screen.getByTestId(
        testIds.DMInformationDisplayName
      );
      expect(displayName.textContent).toBe(
        directMessageMock.recipient.displayName
      );
    });
  });
});
