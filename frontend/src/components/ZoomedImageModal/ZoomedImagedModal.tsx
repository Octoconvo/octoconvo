"use client";

import { Attachment } from "@/types/response";
import { useEffect } from "react";

const ZoomedImageModal = ({
  image,
  closeImage,
}: {
  image: Attachment;
  closeImage: () => void;
}) => {
  const zoomedImageAspect = {
    aspectRatio: `${image?.width / 100}/${image.height / 100}`,
  };

  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImage();
      }
    };

    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("keydown", closeOnEsc);
    };
  });

  return (
    <div className="absolute box-border flex flex-col items-center justify-center left-0 top-0 h-[100dvh] w-[100dvw] z-20 backdrop-blur-md p-8">
      <button
        data-testid="zmd-img-mdl-cls-btn"
        className={
          " absolute right-8 top-8 flex justify-center hover:bg-grey-300 items-center" +
          " min-w-[48px] min-h-[48px] bg-grey-200 rounded-full"
        }
        onClick={() => {
          closeImage();
        }}
      >
        <span className="close-icon"></span>
      </button>

      <div
        data-testid="zmd-img-mdl-img-cntnr"
        style={zoomedImageAspect}
        className={
          "animate-zoom-in bg-grey-200" +
          (image.height > image.width
            ? " h-[min(90%,1080px)] w-auto"
            : image.width / image.height > 2
            ? " w-[min(60%,1920px)] h-auto"
            : " h-[min(90%,1080px)]")
        }
      >
        <img className="w-full h-full" alt="zoomed image" src={image.url}></img>
      </div>
    </div>
  );
};

export default ZoomedImageModal;
