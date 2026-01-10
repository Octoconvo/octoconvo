import DirectMessages from "@/components/DirectMessages/DirectMessages";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DirectMessages />
      {children}
    </>
  );
}
