export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex justify-center items-center flex-auto min-h-[100dvh] bg-gr-bg-d  py-32 px-24">
        {children}
      </main>
    </>
  );
}
