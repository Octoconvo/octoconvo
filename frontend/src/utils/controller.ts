const triggerInputClick = (
  inputRef: React.RefObject<null | HTMLInputElement>
) => {
  const el = inputRef.current as HTMLInputElement;

  if (el) {
    el.click();
  }
};

export { triggerInputClick };
