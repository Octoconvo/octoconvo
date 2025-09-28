"use client";

import { capitaliseStringFirstLetter } from "@/utils/stringUtils";

const RequestActionBtn = ({
  isRead,
  onSubmit,
  action,
}: {
  isRead: boolean;
  action: "ACCEPT" | "REJECT";
  onSubmit: (action: "ACCEPT" | "REJECT") => void;
}) => {
  return (
    <button
      data-testid="ntfctn-rqst-actn-btn"
      onClick={() => {
        onSubmit(action);
      }}
      className={
        "px-[16px] py-[4px] font-regular rounded-[4px] text-p" +
        " hover:bg-brand-4" +
        (isRead
          ? " bg-grey-100 hover:text-grey-100"
          : " bg-black-500 hover:text-black-500")
      }
    >
      {capitaliseStringFirstLetter(action)}
    </button>
  );
};

export default RequestActionBtn;
