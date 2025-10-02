"use client";

import { unescapeString } from "@/utils/stringUtils";

const Payload = ({
  triggeredBy,
  triggeredFor,
  payload,
}: {
  triggeredBy: string;
  triggeredFor: string | null;
  payload: string;
}) => {
  return (
    <>
      <p
        data-testid="ntfctn-rqst-itm-msg"
        className=" max-w-full text-p font-regular"
      >
        <span
          data-testid="ntfctn-rqst-itm-msg-trggrdby"
          className="break-words font-bold text-white-100"
        >
          {unescapeString(triggeredBy)}
        </span>
        <span
          data-testid="ntfctn-rqst-itm-msg-pyld"
          className="font-regular text-white-200 "
        >
          {" " + payload + " "}
        </span>
        {triggeredFor && (
          <span
            data-testid="ntfctn-rqst-itm-msg-trggrdfr"
            className="break-words font-bold text-white-100"
          >
            {unescapeString(triggeredFor)}
          </span>
        )}
      </p>
    </>
  );
};

export default Payload;
