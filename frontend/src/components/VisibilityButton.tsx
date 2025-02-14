const VisibilityButton = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const onClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <button
      data-testid="visibility-button"
      type="button"
      onClick={onClick}
      className="absolute flex items-center justify-center right-4 w-[1em] h-[1em] p-4"
    >
      <span
        data-testid="icon"
        className={isVisible ? "visibility-on-icon" : "visibility-off-icon"}
      ></span>
    </button>
  );
};

export default VisibilityButton;
