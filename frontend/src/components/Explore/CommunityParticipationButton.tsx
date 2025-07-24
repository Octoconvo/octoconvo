import { useState } from "react";

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
  return (
    <button
      onClick={() => {
        if (!isSubmitting) {
          setIsSubmitting(false);
          const joinCommunity = async () => {
            const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

            try {
              const response = await fetch(
                `${domainURL}/community/${communityId}/join`,
                {
                  mode: "cors",
                  credentials: "include",
                  method: "POST",
                }
              );

              const responseData = await response.json();

              if (response.status >= 200 && response.status <= 300) {
                setParticipationStatus(responseData.participant.status);
              }

              if (response.status >= 400) {
                console.log(responseData);
              }
            } catch (err) {
              if (err instanceof Error) {
                console.log(err.message);
              }
            } finally {
              setIsSubmitting(false);
            }
          };

          if (participationStatus === "NONE") {
            joinCommunity();
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
