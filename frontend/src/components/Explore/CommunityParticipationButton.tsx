import { FC, useState } from "react";
import { postCommunityJoinToAPI } from "@/utils/api/community";

const participationButtonText = {
  NONE: "Join",
  ACTIVE: "Joined",
  PENDING: "Requested",
};

type ParticipationStatus = "NONE" | "PENDING" | "ACTIVE" | null;

type CommunityParticipationButtonProps = {
  communityId: string;
  participationStatus: ParticipationStatus;
  setParticipationStatus: React.Dispatch<
    React.SetStateAction<ParticipationStatus>
  >;
};

const CommunityParticipationButton: FC<CommunityParticipationButtonProps> = ({
  communityId,
  participationStatus,
  setParticipationStatus,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const joinCommunity = async () => {
    const { status, participant } = await postCommunityJoinToAPI({
      communityId: communityId,
    });

    if (status >= 200 && status <= 300 && participant) {
      setParticipationStatus(participant.status);
    }
  };

  return (
    <button
      onClick={async () => {
        if (!isSubmitting) {
          setIsSubmitting(false);

          if (participationStatus === "NONE") {
            try {
              await joinCommunity();
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
