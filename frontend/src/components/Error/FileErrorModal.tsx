import { useRef, useEffect } from "react";

const FileErrorModal = ({
  fileError,
  resetFileError,
}: {
  fileError: {
    heading: string;
    message: string;
  };
  resetFileError: () => void;
}) => {
  const fileErrorRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetFileError();
      }
    };

    window.addEventListener("keydown", closeOnEsc);

    return () => {
      window.removeEventListener("keydown", closeOnEsc);
    };
  });

  return (
    <div
      data-testid="fl-err-mdl-cntnr"
      className="absolute w-full h-full left-0 top-0 bg-[rgb(39,36,42,0.1)] z-40"
      onClick={(e) => {
        const isChildren = fileErrorRef.current?.contains(
          e.target as HTMLElement
        );

        if (!isChildren && fileErrorRef.current !== e.target) {
          resetFileError();
        }
      }}
    >
      <div
        data-testid="fl-err-mdl"
        ref={fileErrorRef}
        className="absolute left-[50%] translate-x-[-50%] bottom-[50%] translate-y-[50%] bg-gr-black-2-r p-[32px] z-30 rounded-[8px] border-b-[var(--invalid)] border-b"
      >
        <div className=" flex items-center flex-col gap-[8px] bg-grey-100 p-[32px] rounded-[8px]">
          <p className="text-center text-h6 font-bold">{fileError.heading}</p>
          <p className="text-center text-p font-regular">{fileError.message}</p>
        </div>
      </div>
    </div>
  );
};

export default FileErrorModal;
