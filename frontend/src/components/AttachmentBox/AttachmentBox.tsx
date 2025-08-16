"use client";

import { Attachment } from "@/types/api";

const AttachmentStyles = [
  {
    container: " flex h-[max(320px,29vh)]",
    img: " w-auto",
    button: (index: number) => " max-h-full",
  },
  {
    container: " grid grid-cols-2 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) => " aspect-square",
  },
  {
    container: " grid grid-cols-3 grid-rows-4 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) =>
      index === 0
        ? " row-span-full col-span-2"
        : " row-span-2 col-span 2 aspect-square",
  },
  {
    container: " grid grid-cols-2 grid-rows-2 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) => " aspect-square",
  },
  {
    container: " grid grid-cols-6 grid-rows-5 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) =>
      index < 2
        ? " row-span-3 col-span-3 aspect-square"
        : " row-span-2 col-span-2 aspect-square",
  },
  {
    container: " grid grid-cols-3 grid-rows-2 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) => " aspect-square",
  },
  {
    container: " grid grid-cols-6 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) =>
      index < 1
        ? " row-span-3 col-span-full aspect-[4/2]"
        : " row-span-2 col-span-2 aspect-square",
  },
  {
    container: " grid grid-cols-6 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) =>
      index < 2
        ? " row-span-3 col-span-3 aspect-square"
        : " row-span-2 col-span-2 aspect-square",
  },
  {
    container: " grid grid-cols-3 grid-rows-3 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) => " aspect-square",
  },
  {
    container: " grid grid-cols-6 w-[calc(15vw+240px)]",
    img: " object-cover w-full",
    button: (index: number) =>
      index < 1
        ? " row-span-3 col-span-full aspect-[4/2]"
        : " row-span-2 col-span-2 aspect-square",
  },
];

const AttachmentBox = ({
  attachments,
  zoomImage,
}: {
  attachments: Attachment[];
  zoomImage: (attachment: Attachment) => void;
}) => {
  return (
    <figure
      data-testid="attchmnt-bx-cntnr"
      className={
        "box-border gap-1 rounded-[8px]" +
        AttachmentStyles[attachments.length - 1]?.container
      }
    >
      {attachments.map((attachment, index) => {
        return (
          <button
            data-testid="attchmnt-bx-btn"
            onClick={() => {
              zoomImage(attachment);
            }}
            style={
              attachments.length === 1
                ? {
                    aspectRatio: `${attachment.width / 100}/${
                      attachment.height / 100
                    }`,
                  }
                : {}
            }
            className={
              "bg-grey-200 min-h-full rounded-[8px]" +
              AttachmentStyles[attachments.length - 1].button(index)
            }
            key={index}
          >
            <img
              className={
                "object-center rounded-[8px] h-full" +
                AttachmentStyles[attachments.length - 1]?.img
              }
              src={attachment.thumbnailUrl}
              alt={`attachment ${index}`}
            />
          </button>
        );
      })}
    </figure>
  );
};

export default AttachmentBox;
