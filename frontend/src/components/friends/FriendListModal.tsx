"use client";

import { FriendListModalContext } from "@/contexts/modal";
import useAnimate from "@/hooks/useAnimate";
import { FC, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriendsFromAPI } from "@/utils/api/friend";
import Loader from "../loader";
import FriendList from "./FriendList";
import testIds from "@/utils/tests/testIds";

type FriendListModalContainerProps = {
  children: React.ReactNode;
};

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
            "relative w-[480px] bg-black-200 overflow-auto min-h-[100dvh]" +
            " max-h-[100dvh] scrollbar"
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
          <div className="flex justify-center items-center"> {children}</div>
        </section>
      </div>
    </div>
  );
};

const FriendListModal = () => {
  const { modalRef, isOpen } = useContext(FriendListModalContext);
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: [`friends`],
    queryFn: getUserFriendsFromAPI,
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
        {data.friends && data.friends?.length < 1 && (
          <p>You have no friends yet</p>
        )}
        {data.friends && <FriendList friends={data.friends} />}
        <div>{isFetching ? "Updating..." : ""}</div>
      </FriendListModalContainer>
    </>
  );
};

export default FriendListModal;
