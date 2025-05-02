import ActiveModalProvider from "@/components/ActiveModalProvider";
import LobbyNavWrapper from "@/components/Lobby/LobbyNavWrapper";
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";
import EditProfileModalProvider from "@/components/EditProfile/EditProfileModalProvider";
import CreateCommunityModalProvider from "@/components/CreateCommunity/CreateCommunityModalProvider";

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
            <CreateCommunityModalProvider>
              {children}
              <LobbyNavWrapper />
            </CreateCommunityModalProvider>
          </EditProfileModalProvider>
        </ActiveModalProvider>
      </ProtectedRouteWrapper>
    </div>
  );
}
