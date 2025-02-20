import HomepageNav from "@/components/HomepageNav";
import Link from "next/link";
import Image from "next/image";
import SocketWrapper from "@/components/SocketWrapper";

export default function Home() {
  return (
    <SocketWrapper>
      <div className="flex flex-col flex-auto">
        <header className="flex p-8 w-full justify-between items-center">
          <Link href="/" className="flex gap-4 items-center">
            <Image
              src="/images/octoconvo.svg"
              width={38}
              height={38}
              alt="Octoconvo logo"
            />
            <p className="text-h4 font-bold">Octoconvo</p>
          </Link>
          <HomepageNav />
        </header>
        <main className="flex flex-auto items-start p-16 justify-between gap-[48px]">
          <div className="flex flex-col gap-[64px]">
            <h1 className="text-h1 font-bold">
              Connect and chat<br></br>with your friends
            </h1>
            <p className="text-h5 font-bold">
              Have fun and chill with your friends on octoconvo. <br></br> build
              engaging communities and chat with other people.
            </p>
          </div>
          <div className="w-[min(calc(250px+20vw),1080px)] rounded-[16px] shadow-[-2rem_-2rem_0px_0px_var(--brand-1)]">
            <Image
              src="/images/octoconvo.svg"
              height={640}
              width={640}
              alt="Octoconvo features screenshot"
              className="bg-brand-2 w-full h-auto"
            ></Image>
          </div>
        </main>
      </div>
    </SocketWrapper>
  );
}
