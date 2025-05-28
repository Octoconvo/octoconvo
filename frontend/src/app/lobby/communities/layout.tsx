import CommunitiesListWrapper from "@/components/Communities/CommunitiesList/CommunitiesListWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[100dvh] flex flex-auto bg-gradient-to-r from-brand-2 from-30% to-brand-1 to-100% animate-[300ms_fade-out]">
      <CommunitiesListWrapper />
      <div className="community-bg relative flex items-center justify-center w-full ">
        {children}
      </div>
    </div>
  );
}
