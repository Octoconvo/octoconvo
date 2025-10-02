"use client";

import { FriendListModalContext } from "@/contexts/modal";
import useAnimate from "@/hooks/useAnimate";
import { FC, useContext, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserFriendsFromAPI } from "@/utils/api/friend";
import Loader from "../loader";
import FriendList from "./FriendList";
import testIds from "@/utils/tests/testIds";
import { Fragment } from "react";
import useInfiniteLoader from "@/hooks/useInfiniteLoader";
import useCloseOnEscape from "@/hooks/useCloseOnEscape";

interface FriendListModalContainerProps {
  children: React.ReactNode;
}

const FriendListModalContainer: FC<FriendListModalContainerProps> = ({
  children,
}) => {
  const { modalRef, isOpen, isInitial } = useContext(FriendListModalContext);
  const isClosed = !isOpen;

  return (
    <div
      ref={modalRef}
      data-testid={testIds.friendListModal}
      className={
        "absolute top-0 left-[100%] h-full bg-gr-black-2-r p-[16px]" +
        " max-h-[100dvh] rounded-tr-[16px] rounded-br-[16px] box-border" +
        (isOpen ? " animate-slide-right" : " animate-slide-left") +
        (isInitial && isClosed ? " hidden" : "")
      }
    >
      <div className="rounded-[16px] overflow-hidden max-h-full">
        <section
          className={
            "relative w-[480px] bg-black-200 overflow-auto box-border" +
            " max-h-[calc(100dvh-48px)] min-h-[calc(100dvh-48px)] scrollbar"
          }
        >
          <h1
            className={
              "sticky top-0 bg-black-200 p-[24px] text-h5 font-bold" +
              " rounded-[inherit]"
            }
          >
            Friends
          </h1>
          <div className="flex flex-col justify-center items-center">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

const FriendListModal = () => {
  const { modalRef, isOpen, setIsOpen } = useContext(FriendListModalContext);
  let friendsCount = 0;
  const fetchNextPageRef = useRef<HTMLDivElement | null>(null);
  const {
    isPending,
    error,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [`friends`],
    queryFn: async ({ pageParam }) => getUserFriendsFromAPI({ pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => {
      if (lastPage.nextCursor?.toString().toUpperCase() === "FALSE") {
        return;
      }

      return lastPage.nextCursor?.toString();
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
  useCloseOnEscape({
    closeModal: () => {
      setIsOpen(false);
    },
  });

  const showModal = () => {
    const HTMLElement = modalRef?.current;
    HTMLElement?.classList.add("z-10");
    HTMLElement?.classList.remove("z-0", "hidden");
  };

  const hideModal = () => {
    const HTMLElement = modalRef?.current;
    HTMLElement?.classList.add("z-0", "hidden");
    HTMLElement?.classList.remove("z-10");
  };

  const onAnimateEnd = () => {
    if (isOpen) {
      showModal();
    } else {
      hideModal();
    }
  };

  useAnimate({
    ref: modalRef,
    onAnimateStart: () => {},
    onAnimateEnd: onAnimateEnd,
  });

  if (isPending)
    return (
      <FriendListModalContainer>
        <div className="w-[64px] h-[64px]">
          <Loader size={64} />
        </div>
      </FriendListModalContainer>
    );

  if (error)
    return (
      <FriendListModalContainer>
        <div>{"An error has occured: " + error.message}</div>
      </FriendListModalContainer>
    );

  return (
    <>
      <FriendListModalContainer>
        <ul
          className={
            "flex flex-col gap-[16px] p-[16px] h-full w-full" + " box-border"
          }
        >
          {data.pages.map((data, i) => {
            friendsCount = friendsCount + (data.friends?.length || 0);

            return (
              <Fragment key={i}>
                {!friendsCount && <p>You have no friends yet</p>}
                {data.friends && <FriendList friends={data.friends} />}
              </Fragment>
            );
          })}
        </ul>
        {hasNextPage && (
          <div
            ref={fetchNextPageRef}
            data-testid={testIds.friendListModalInfiniteLoader}
            className="min-h-[32px] w-full"
          ></div>
        )}
        {(isFetching || isFetchingNextPage) && (
          <div className="mb-[24px]">
            <Loader size={48} />
          </div>
        )}
      </FriendListModalContainer>
    </>
  );
};

export default FriendListModal;
