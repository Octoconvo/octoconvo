const createHTMLNewLine = (input: string) => {
  const strings = input.split("\n");
  const newlines = [...input.matchAll(/\n/g)];

  const content = strings.map((string, index) => {
    if (index < newlines.length) {
      return (
        <p key={index}>
          {string}
          <br key={index} />
        </p>
      );
    } else {
      return <p key={index}>{string}</p>;
    }
  });

  return <>{content}</>;
};

interface CloseModal {
  (): void;
}

interface CloseOnOutsideClickArgs {
  e: React.MouseEvent;
  ref: null | React.RefObject<null | HTMLElement>;
  closeModal: CloseModal;
}

const closeOnOutsideClick = ({
  e,
  ref,
  closeModal,
}: CloseOnOutsideClickArgs) => {
  if (ref === null || ref.current === null) {
    return;
  }

  const isChildren = ref?.current?.contains(e.target as HTMLElement);
  if (!isChildren && ref?.current !== e.target) {
    closeModal();
  }
};

export { createHTMLNewLine, closeOnOutsideClick };
