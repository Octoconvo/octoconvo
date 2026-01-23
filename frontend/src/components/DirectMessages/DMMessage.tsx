import { InboxMessageAPI } from "@/types/api";
import { FC, useContext, useState } from "react";
import Avatar from "../Avatar";
import { createHTMLNewLine } from "@/utils/HTMLUtils";
import { unescapeString } from "@/utils/stringUtils";
import { UserContext } from "@/contexts/user";
import AttachmentBox from "../AttachmentBox/AttachmentBox";
import { AttachmentAPI } from "@/types/api";
import ZoomedImageModal from "../ZoomedImageModal/ZoomedImagedModal";
import testIds from "@/utils/tests/testIds";

interface DMMessageProps {
  message: InboxMessageAPI;
}

const DMMessage: FC<DMMessageProps> = ({ message }) => {
  const { user } = useContext(UserContext);
  const [zoomedImage, setZoomedImage] = useState<AttachmentAPI | null>(null);

  return (
    <li key={message.id} className="flex gap-[32px] scroll-smooth">
      {zoomedImage && (
        <ZoomedImageModal
          image={zoomedImage}
          closeImage={() => setZoomedImage(null)}
        />
      )}
      <Avatar
        testId={testIds.DMMessageAuthorAvatar}
        avatar={message.author.avatar}
        size="48px"
      />
      <div
        className={
          "flex flex-col gap-[8px] text-p bg-grey-100" +
          " p-[32px] rounded-tr-[8px] rounded-br-[8px]"
        }
      >
        <p
          data-testid={testIds.DMMessageAuthorDisplayName}
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
        <div data-testid={testIds.DMMessageContent}>
          {createHTMLNewLine(unescapeString(message.content))}
        </div>

        {message.attachments?.length ? (
          <AttachmentBox
            attachments={message.attachments}
            zoomImage={(attachment: AttachmentAPI) =>
              setZoomedImage(attachment)
            }
          />
        ) : null}
      </div>
    </li>
  );
};

export default DMMessage;
