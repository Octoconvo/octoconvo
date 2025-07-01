import ExplorePage from "@/components/Explore/ExplorePage";

export default function Explore() {
  return (
    <div
      className={
        "flex flex-col gap-[32px] bg-black-200 p-[32px] w-full" +
        " max-h-[100dvh] box-border"
      }
    >
      <ExplorePage />
    </div>
  );
}
