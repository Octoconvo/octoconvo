import { NotificationGET } from "@/types/response";
import { unescapeString, capitaliseStringFirstLetter } from "@/utils/string";

const NotificationRequestItem = ({
  notification,
}: {
  notification: NotificationGET;
}) => {
  return (
    <li
      data-testid="ntfctn-rqst-itm"
      className={
        "flex flex-col gap-[16px] p-[16px] rounded-[4px] w-full" +
        (notification.isRead ? " bg-gr-black-1-b" : " bg-brand-1-2")
      }
    >
      <p
        data-testid="ntfctn-rqst-itm-msg"
        className=" max-w-full text-p font-regular"
      >
        <span
          data-testid="ntfctn-rqst-itm-msg-usr-usrnm"
          className="break-words font-bold text-white-100"
        >
          {notification.triggeredBy.username}
        </span>
        <span
          data-testid="ntfctn-rqst-itm-msg-pyld"
          className="font-regular text-white-200 "
        >
          {" " + notification.payload + " "}
        </span>
        <span
          data-testid="ntfctn-rqst-itm-msg-cmmnty-nm"
          className="break-words font-bold text-white-100"
        >
          {notification.type === "COMMUNITYREQUEST" &&
            notification.community &&
            unescapeString(notification.community.name)}
        </span>
      </p>
      {(notification.status === "REJECTED" ||
        notification.status === "ACCEPTED") && (
        <p data-testid="ntfctn-rqst-itm-sts-updt">
          {capitaliseStringFirstLetter(notification.status)}
        </p>
      )}
      {notification.status === "PENDING" && (
        <div
          data-testid="ntfctn-rqst-itm-btn-lst"
          className="flex gap-[16px] self-end"
        >
          <button
            className={
              "px-[16px] py-[4px] font-regular rounded-[4px] text-p" +
              " hover:bg-brand-4" +
              (notification.isRead
                ? " bg-grey-100 hover:text-grey-100"
                : " bg-black-500 hover:text-black-500")
            }
          >
            Accept
          </button>
          <button
            className={
              "px-[16px] py-[4px] font-regular rounded-[4px] text-p" +
              " hover:bg-invalid" +
              (notification.isRead ? " bg-grey-100" : " bg-black-500")
            }
          >
            Reject
          </button>
        </div>
      )}
    </li>
  );
};

export default NotificationRequestItem;
