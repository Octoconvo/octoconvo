"use client";

import { getDirectMessageById } from "@/utils/api/directMessage";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Avatar from "../Avatar";
import Loader from "../loader";
import testIds from "@/utils/tests/testIds";

const DirectMessageContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="bg-black-400 w-full h-full">{children}</div>;
};

const DirectMessage = () => {
  const { directmessageid } = useParams<{ directmessageid: string }>();

  const { isPending, error, data } = useQuery({
    queryKey: ["directMessage"],
    queryFn: async () => {
      const res = await getDirectMessageById(directmessageid);

      if (res.status === 401) {
        throw new Error(res.error?.message || "401 Error");
      }

      return res;
    },
  });

  if (isPending) {
    return (
      <DirectMessageContainer>
        <div
          className={
            "flex justify-center w-full p-[32px] bg-black-200 gap-[32px]" +
            " items-center"
          }
        >
          <div className="w-[32px] h-[32px]">
            <Loader size={32} />
          </div>
        </div>
      </DirectMessageContainer>
    );
  }

  if (error) {
    return (
      <DirectMessageContainer>
        <p>Something went wrong!</p>
      </DirectMessageContainer>
    );
  }

  return (
    <DirectMessageContainer>
      {data && (
        <section
          data-testid={testIds.DMInformationItem}
          className={
            "w-full p-[32px] bg-black-200 flex gap-[32px]" + " items-center"
          }
        >
          <Avatar
            avatar={data?.directMessage.recipient.avatar}
            testId={testIds.DMInformationAvatar}
            size="48px"
          />
          <p
            data-testid={testIds.DMInformationDisplayName}
            className="text-h6 text-white-100 font-bold"
          >
            {data?.directMessage.recipient.displayName}
          </p>
        </section>
      )}
    </DirectMessageContainer>
  );
};

export default DirectMessage;
