import ActiveModalProvider from "@/components/ActiveModalProvider";
import LobbyNavWrapper from "@/components/LobbyNavWrapper";
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-auto bg-black-200">
      <ProtectedRouteWrapper route="\login">
        <ActiveModalProvider>
          <LobbyNavWrapper />
          {children}
        </ActiveModalProvider>
      </ProtectedRouteWrapper>
    </div>
  );
}
