const Loader = ({ size }: { size: number }) => {
  return <div className={"spinner" + ` min-w-[${size}px] min-h-[${size}px]`}></div>;
};

export default Loader;
