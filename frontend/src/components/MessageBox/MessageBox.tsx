import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CommunityMessageForm,
  ValidationError as ValidationErrorType,
} from "@/types/form";
import { triggerInputClick } from "@/utils/controllerUtils";
import { communityMessageValidation } from "@/utils/formUtils";
import { previewImage, validateFiles } from "@/utils/fileUtils";
import ImagePreviewBox from "./ImagePreviewBox";
import ValidationError from "@/components/ValidationError";
import Loader from "@/components/loader";
import FileErrorModal from "../Error/FileErrorModal";

const MessageBox = ({
  path,
  inboxId,
  attachment,
}: {
  path: string;
  inboxId: string;
  attachment: {
    totalSize: number;
    maxSize: number;
    limit: number;
  };
}) => {
  const [attachments, setAttachments] = useState<
    { file: File; string: string | null }[]
  >([]);
  const attachmentsInputRef = useRef<null | HTMLInputElement>(null);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<CommunityMessageForm>();
  const attachmentsRegister = register("attachments");
  const [fileError, setFileError] = useState<{
    heading: string;
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<ValidationErrorType[]>(
    []
  );

  const onSubmit: SubmitHandler<CommunityMessageForm> = async (
    data: CommunityMessageForm
  ) => {
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("content", data.content);
    formData.append("inboxid", inboxId);

    attachments.forEach((file) => {
      formData.append("attachments", file.file);
    });

    const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

    try {
      const response = await fetch(`${domainURL}/${path}`, {
        mode: "cors",
        credentials: "include",
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      // Handle errors
      if (response.status >= 400) {
        if (response.status === 422) {
          setValidationError(responseData.error.validationError);
        }

        if (response.status === 401 || response.status === 403) {
          console.log(responseData.error.message);
        }
      }

      // Handle success response
      if (response.status < 400) {
        reset();
        setAttachments([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {fileError && (
        <FileErrorModal
          fileError={fileError}
          resetFileError={() => setFileError(null)}
        />
      )}
      {attachments.length ? (
        <div className="relative">
          <ul
            data-testid="msg-box-attchmnt-ulist"
            className="absolute translate-y-[-100%] scrollbar flex min-w-0 max-w-full bg-gr-black-2-r w-[min-content] rounded-t-[8px] box-border gap-[32px] p-[32px] overflow-x-scroll"
          >
            {attachments.map((image, index) => {
              return (
                <ImagePreviewBox
                  key={image.file.name + index}
                  image={image}
                  index={index}
                  removeImage={({
                    image,
                  }: {
                    image: {
                      file: File;
                      index: number;
                    };
                  }) => {
                    const updatedAttachments = attachments.filter(
                      (attachment, index) => {
                        return !(
                          attachment.file.name === image.file.name &&
                          index === image.index
                        );
                      }
                    );

                    setAttachments([...updatedAttachments]);
                  }}
                />
              );
            })}
          </ul>
        </div>
      ) : null}
      <form
        method="POST"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();

          // Ensure onSubmit is not called when inboxId is an empty string
          if (inboxId && !isSubmitting) {
            handleSubmit(onSubmit)();
          }
        }}
        className="flex flex-col gap-[8px] bg-black-400 p-[32px]"
      >
        {validationError.map((error) => (
          <ValidationError
            key={error.field}
            validationError={validationError}
            field={error.field}
          />
        ))}
        {errors.content && (
          <div className="text-invalid text-p">{errors.content.message}</div>
        )}
        <div className="flex items-center gap-[16px] px-[32PX] py-[16PX] bg-grey-100 rounded-[8px]">
          <div className="hover:scale-105 bg-gr-silver-b p-[4px] rounded-[8px]">
            <button
              aria-label="Add attachments"
              type="button"
              className="attachment-btn w-[32px] h-[32px]"
              onClick={() => triggerInputClick(attachmentsInputRef)}
            ></button>
          </div>
          <input
            data-testid="msg-box-attchmnt-input"
            type="file"
            id="attachments"
            accept="image/png, image/jpeg"
            className="hidden"
            size={attachment.maxSize}
            multiple
            {...attachmentsRegister}
            ref={(e) => {
              attachmentsRegister.ref(e);
              attachmentsInputRef.current = e;
            }}
            onInput={async (e) => {
              // Reset validation error
              setValidationError([]);

              try {
                // Validate attachments input file limit
                if (attachmentsInputRef.current) {
                  const length =
                    (attachmentsInputRef.current.files?.length || 0) +
                    attachments.length;
                  let totalSize = 0;

                  if (attachmentsInputRef.current.files) {
                    const files = attachmentsInputRef.current.files as FileList;

                    for (const file of files) {
                      totalSize += file.size;
                    }
                  }

                  for (const file of attachments) {
                    totalSize += file.file.size;
                  }

                  if (length > attachment.limit) {
                    throw new Error("File limit exceeded");
                  }

                  // Throw error if total attachment size is exceeded
                  if (totalSize > attachment.totalSize) {
                    throw new Error("Total file size exceeded");
                  }
                }

                // Process attachments input files and previews
                const processedAttachments: {
                  file: File;
                  string: string | null;
                }[] = [];

                const images = validateFiles({
                  e,
                  mimetype: ["image/jpeg", "image/png"],
                  maxSize: attachment.maxSize,
                });

                if (images) {
                  for (const image of images) {
                    const setFile = async () => {
                      const preview = await previewImage({
                        file: image,
                        maxHeight: 320,
                      });
                      processedAttachments.push({
                        file: image,
                        string: preview,
                      });
                    };

                    await setFile();
                  }
                }

                setAttachments([...attachments, ...processedAttachments]);
              } catch (err) {
                // Show client error modal'
                if (err instanceof Error) {
                  if (err.message === "Invalid mimetype") {
                    setFileError({
                      heading: "Invalid file type",
                      message: "You can only upload jpeg or png images",
                    });
                  }

                  if (err.message === "File size is too big") {
                    const size = attachment.maxSize / 1000000;

                    setFileError({
                      heading: "File size is too big",
                      message: `The maximum file size for attachment is ${size} MB`,
                    });
                  }

                  if (err.message === "File limit exceeded") {
                    setFileError({
                      heading: "Too many upload",
                      message: "You can only attach 10 files per message",
                    });
                  }

                  if (err.message === "Total file size exceeded") {
                    const totalSize = attachment.totalSize / 1000000;

                    setFileError({
                      heading: "Total file size is too big",
                      message: `You can only attach a total of ${totalSize} MB per message`,
                    });
                  }
                }
              } finally {
                /* Reset attachments file input to prevent the default behaviour 
                of file input where users can't select the same file in a row. */

                if (attachmentsInputRef.current) {
                  attachmentsInputRef.current.value = "";
                }
              }
            }}
          ></input>
          <textarea
            data-testid="msg-bx-txtr-cntnt"
            rows={1}
            id="content"
            {...register("content", communityMessageValidation)}
            className="py-[8px] px-[16px] resize-none max-h-min text-white-100 bg-grey-100 w-full"
            onInput={() => {
              // Reset validation error
              setValidationError([]);
            }}
          ></textarea>
          {isSubmitting ? (
            <Loader size={32} />
          ) : (
            <button
              aria-label="Send"
              className="send-btn min-w-[32px] min-h-[32px]"
            ></button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageBox;
