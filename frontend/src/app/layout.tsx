import type { Metadata } from "next";
import "./global.css";
import { inter } from "@/fonts";
import SocketWrapper from "@/components/SocketWrapper";
import UserProvider from "@/components/UserProvider";

export const metadata: Metadata = {
  title: "Octoconvo",
  description: "Social chatting application that is fun and engaging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-[100dvh]">
      <body className={`${inter.variable} font-sans flex h-full`}>
        <SocketWrapper>
          <UserProvider>{children}</UserProvider>
        </SocketWrapper>
      </body>
    </html>
  );
}
