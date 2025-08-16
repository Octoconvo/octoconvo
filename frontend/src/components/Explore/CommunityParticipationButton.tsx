import { useState } from "react";
import { postCommunityJoinToAPI } from "@/utils/api/community";

const participationButtonText = {
  NONE: "Join",
  ACTIVE: "Joined",
  PENDING: "Requested",
};

const CommunityParticipationButton = ({
  communityId,
  participationStatus,
  setParticipationStatus,
}: {
  communityId: string;
  participationStatus: "NONE" | "PENDING" | "ACTIVE" | null;
  setParticipationStatus: React.Dispatch<
    React.SetStateAction<"NONE" | "PENDING" | "ACTIVE" | null>
  >;
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const postCommunityJoinToAPIAndUpdateParticipationStatus = async () => {
    const postCommunityJoinToAPIResponseData = await postCommunityJoinToAPI({
      communityId: communityId,
    });

    if (
      postCommunityJoinToAPIResponseData.status >= 200 &&
      postCommunityJoinToAPIResponseData.status <= 300 &&
      postCommunityJoinToAPIResponseData.participant
    ) {
      setParticipationStatus(
        postCommunityJoinToAPIResponseData.participant.status
      );
    }
  };

  return (
    <button
      onClick={() => {
        if (!isSubmitting) {
          setIsSubmitting(false);

          if (participationStatus === "NONE") {
            try {
              postCommunityJoinToAPIAndUpdateParticipationStatus();
            } catch (err) {
              if (err instanceof Error) {
                console.log(err.message);
              }
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      }}
      data-testid="xplr-cmmnty-mdl-prtcptn-btn"
      className={
        "bg-grey-100 py-[4px] px-[16px] rounded-[4px]" + " hover:bg-brand-1"
      }
    >
      {participationStatus
        ? participationButtonText[participationStatus]
        : "Loading..."}
    </button>
  );
};

export default CommunityParticipationButton;
