import { InboxMessageAPI } from "@/types/api";
import { FC } from "react";
import DMMessage from "./DMMessage";

interface DMMessageList {
  messages: InboxMessageAPI[];
}

const DMMessageList: FC<DMMessageList> = ({ messages }) => {
  return (
    <>
      {messages.map((message: InboxMessageAPI) => (
        <DMMessage message={message} key={message.id} />
      ))}
    </>
  );
};

export default DMMessageList;
