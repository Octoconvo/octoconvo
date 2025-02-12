const InputWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col  w-[640px] text-h6 gap-4">{children}</div>
  );
};

export default InputWrapper;
