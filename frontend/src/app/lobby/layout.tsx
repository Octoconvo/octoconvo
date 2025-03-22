import ActiveModalProvider from "@/components/ActiveModalProvider";
import LobbyNavWrapper from "@/components/LobbyNavWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-auto bg-black-200">
      <ActiveModalProvider>
        <LobbyNavWrapper />
        {children}
      </ActiveModalProvider>
    </div>
  );
}
