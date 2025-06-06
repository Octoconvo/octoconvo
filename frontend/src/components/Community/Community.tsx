"use client";

import { UserContext } from "@/contexts/user";
import { CommunityResponseGET, InboxMessageGET } from "@/types/response";
import { useContext, useEffect, useRef, useState } from "react";
import MessageBox from "../MessageBox/MessageBox";
import Image from "next/image";

const Community = ({ id }: { id: string | null }) => {
  const [community, setCommunity] = useState<null | CommunityResponseGET>(null);
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState<InboxMessageGET[] | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | false>();
  const prevObserverRef = useRef<null | HTMLDivElement>(null);
  const messageListRef = useRef<null | HTMLUListElement>(null);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const [scrollToBottom, setScrolltoBottom] = useState<boolean>(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(`${domainURL}/community/${id}`, {
          method: "GET",
          credentials: "include",
        });

        const resData = await res.json();

        console.log({
          resData,
        });

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          setCommunity(resData.community);
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    const fetchMessages = async ({ inboxId }: { inboxId: string }) => {
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(
          `${domainURL}/inbox/${inboxId}/messages?limit=10&direction=backward`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          if (messages === null) {
            setMessages(resData.messagesData);
            setPrevCursor(resData.prevCursor);

            // Update prevScrollHeight to be used to retain scroll position
            if (messageListRef.current) {
              setScrolltoBottom(true);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    const fetchPrevMessages = async ({
      inboxId,
      prevCursor,
    }: {
      inboxId: string;
      prevCursor: string;
    }) => {
      console.log({ inboxId, prevCursor });
      const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

      try {
        const res = await fetch(
          `${domainURL}/inbox/${inboxId}/messages?limit=10&direction=backward&cursor=${prevCursor}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const resData = await res.json();

        if (res.status >= 400) {
          console.log(resData.message);
        }

        if (res.status >= 200 && res.status <= 300) {
          setMessages([...resData.messagesData, ...(messages as InboxMessageGET[])]);
          setPrevCursor(resData.prevCursor);

          // Update prevScrollHeight to be used to retain scroll position
          if (messageListRef.current) {
            setScrollHeight(messageListRef?.current.scrollHeight);
            setScrolltoBottom(true);
          }
        }
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    };

    if (user && community === null) {
      fetchCommunity();
    }

    if (community && messages === null) {
      fetchMessages({ inboxId: community.inbox.id });
    }

    // Retain scroll position after fetching messages
    if (scrollToBottom) {
      const messageList = messageListRef?.current;
      if (messageList) {
        messageList.scrollTo(0, messageList.scrollHeight - scrollHeight);
        setScrolltoBottom(false);
      }
    }

    // Add observer

    const prevObserver = prevObserverRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => console.log(entry.intersectionRatio));
        if (entries[0].isIntersecting) {
          // Fetch previous messages with cursor
          // Fetch if cursor is not false

          if (prevCursor && community) {
            console.log(entries);
            fetchPrevMessages({ inboxId: community?.inbox.id, prevCursor });
          }
        }
      },
      {
        threshold: 1,
      }
    );

    if (prevObserver) {
      observer.observe(prevObserver);
    }

    return () => {
      if (prevObserver) {
        observer.unobserve(prevObserver);
      }
    };
  }, [user, messages, community, id, prevCursor, scrollHeight, scrollToBottom]);

  return (
    <section className="flex min-w-0 flex-col w-full h-full max-h-[100dvh] box-border bg-gr-black-1-b">
      <h1 className="bg-pink-50 p-[32px] text-white-100 text-h6 font-bold bg-gr-black-1-l text-center">
        {community ? community.name : ""}
      </h1>
      <ul
        data-testid="cmmnty-msgs-ulst"
        ref={messageListRef}
        className="relative scrollbar flex flex-col flex-auto overflow-x-auto max-h-full box-border p-[48px] gap-[64px]"
      >
        <div ref={prevObserverRef} className="absolute left-0 top-0 bg-purple-50"></div>
        {messages &&
          messages.map((message) => {
            return (
              <li key={message.id} className="flex gap-[32px] scroll-smooth">
                <figure
                  className={
                    "p-2 top-[calc(-32px-0.25rem)] bg-black-200 " +
                    " min-w-[48px] min-h-[48px] rounded-full"
                  }
                >
                  <Image
                    data-testid="avatar"
                    src={
                      message?.author.avatar ? message.author?.avatar : "/images/avatar_icon.svg"
                    }
                    width={48}
                    height={48}
                    className="rounded-full min-w-[48px] min-h-[48x] bg-white-200"
                    alt="User avatar"
                  ></Image>
                </figure>
                <div className="flex flex-col gap-[8px] text-p bg-grey-100 p-[32px] rounded-tr-[8px] rounded-br-[8px]">
                  <p
                    className={
                      "font-bold" +
                      (user
                        ? user.id === message.authorId
                          ? " text-brand-3-d-1"
                          : " text-white-100"
                        : " text-white-100")
                    }
                  >
                    {message.author.displayName}
                  </p>
                  {message.content}
                </div>
              </li>
            );
          })}
      </ul>
      <MessageBox
        path="community"
        inboxId={community?.inbox.id || ""}
        attachment={{
          maxSize: 5000000,
          limit: 10,
          totalSize: 10000000,
        }}
      />
    </section>
  );
};

export default Community;
