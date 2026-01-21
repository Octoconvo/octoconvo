"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import useInfiniteLoader from "@/hooks/useInfiniteLoader";
import { getDMMessages } from "@/utils/api/directMessage";
import { useParams } from "next/navigation";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import DMMessageList from "./DMMessageList";
import Loader from "../loader";
import { InboxMessageAPI } from "@/types/api";
import testIds from "@/utils/tests/testIds";

interface DMMessagesContainerProps {
  children: React.ReactNode;
  messageContainerRef: React.RefObject<HTMLDivElement | null>;
}

const DMMessagesContainer: FC<DMMessagesContainerProps> = ({
  children,
  messageContainerRef,
}) => {
  return (
    <div
      ref={messageContainerRef}
      className={
        "max-h-full flex-auto flex flex-col box-border overflow-x-auto" +
        " scrollbar"
      }
    >
      {children}
    </div>
  );
};

const DMMessages = () => {
  const [prevScrollPosition, setPrevScrollPosition] = useState<number>(0);
  const messageContainerRef = useRef<null | HTMLDivElement>(null);
  const fetchNextPageRef = useRef<HTMLDivElement | null>(null);
  const { directmessageid } = useParams<{ directmessageid: string }>();
  const {
    isPending,
    error,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [`dmmessages`, directmessageid],
    queryFn: async ({ pageParam }) => {
      const res = await getDMMessages({
        cursor: pageParam,
        DMId: directmessageid,
      });

      if (res.status === 401) {
        throw new Error(res.error?.message || "401 Error");
      }

      return res;
    },
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => {
      if (lastPage.nextCursor === null) {
        return;
      }

      return lastPage.nextCursor;
    },
  });

  useInfiniteLoader({
    ref: fetchNextPageRef,
    fetchNextPage: () => {
      if (hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    threshold: 1,
  });

  useEffect(() => {
    const messageContainer: null | HTMLDivElement = messageContainerRef.current;

    if (messageContainer) {
      messageContainer.scrollTo(
        0,
        messageContainer.scrollHeight - prevScrollPosition
      );
      setPrevScrollPosition(messageContainer.scrollHeight);
    }
    return () => {};
  }, [data?.pages]);

  if (isPending) {
    return (
      <DMMessagesContainer messageContainerRef={messageContainerRef}>
        <div className="mb-[24px] w-full flex justify-center">
          <Loader size={48} />
        </div>
      </DMMessagesContainer>
    );
  }

  if (error) {
    return (
      <DMMessagesContainer messageContainerRef={messageContainerRef}>
        <p>Something went wrong!</p>
      </DMMessagesContainer>
    );
  }

  return (
    <DMMessagesContainer messageContainerRef={messageContainerRef}>
      {(isFetching || isFetchingNextPage) && (
        <div className="mb-[24px] w-full flex justify-center">
          <Loader size={48} />
        </div>
      )}
      {hasNextPage && !isFetchingNextPage && (
        <div
          ref={fetchNextPageRef}
          data-testid={testIds.DMMessagesInfiniteLoader}
          className="min-h-[32px] w-full"
        ></div>
      )}
      <ul className={"w-full flex flex-col p-[48px] gap-[64px] box-border"}>
        {data?.pages
          .map((data, index: number) => {
            const reversedMessagesData: InboxMessageAPI[] = data.messagesData
              .slice()
              .reverse();
            return (
              <Fragment key={index}>
                {data.messagesData && (
                  <DMMessageList messages={reversedMessagesData} />
                )}
              </Fragment>
            );
          })
          .slice()
          .reverse()}
      </ul>
    </DMMessagesContainer>
  );
};

export default DMMessages;
