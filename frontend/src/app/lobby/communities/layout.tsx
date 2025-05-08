import CommunitiesListWrapper from "@/components/Communities/CommunitiesList/CommunitiesListWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-[100dvh] flex flex-auto bg-gradient-to-r from-brand-2 from-30% to-brand-1 to-100% animate-[300ms_fade-out]">
      <CommunitiesListWrapper />
      <div className="relative flex items-center justify-center w-full ">
        <div className="community-circle">
          <div className="flex justify-center items-center rounded-full h-[256px] w-[256px]">
            <span className="octoconvo-community-icon after:w-[128px] after:h-[128px]"></span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
