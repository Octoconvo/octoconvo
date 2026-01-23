import DirectMessageHeader from "./DirectMessageHeader";
import DMMessages from "./DMMessages";

const DirectMessage = () => {
  return (
    <div className="w-full bg-black-400 max-h-[100dvh] box-border flex flex-col">
      <DirectMessageHeader />
      <DMMessages />
    </div>
  );
};

export default DirectMessage;
