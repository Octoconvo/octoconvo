import ActiveModalProvider from "@/components/ActiveModalProvider";
import LobbyNavWrapper from "@/components/LobbyNavWrapper";
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";
import EditProfileModalProvider from "@/components/EditProfileModalProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-auto bg-black-200">
      <ProtectedRouteWrapper route="\login">
        <ActiveModalProvider>
          <EditProfileModalProvider>
            <LobbyNavWrapper />
            {children}
          </EditProfileModalProvider>
        </ActiveModalProvider>
      </ProtectedRouteWrapper>
    </div>
  );
}
