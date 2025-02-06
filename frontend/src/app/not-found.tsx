import BackButton from "@/components/BackButton";
import { ibmPlexMono } from "@/styles/fonts";
import Image from "next/image";

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col box-border flex-auto items-center justify-center bg-gr-bg-d gap-12 py-32 px-8">
      <div className="relative w-[min(calc(240px+16vw),80vw)] h-[min(calc(180px+12vw),60vw)] image-bg-404">
        <div className="absolute animate-[bounce_6s_ease-in-out_infinite] motion-reduce:animate[bounce_11s_ease-in-out_infinite] w-[calc(40px+20%)] top-[1%] right-[40%]">
          <Image
            width={512}
            height={512}
            src="/images/octo-4.svg"
            alt="A happy green octo"
            priority={true}
          ></Image>
        </div>

        <div className="absolute animate-[bounce_5.75s_ease-in-out_infinite] motion-reduce:animate[bounce_10.75s_ease-in-out_infinite] w-[calc(40px+20%)] bottom-[40%] left-[15%]">
          <Image
            width={512}
            height={512}
            src="/images/octo-3.svg"
            alt="A happy blue octo"
            priority={true}
          ></Image>
        </div>
        <div className="absolute animate-[bounce_5.5s_ease-in-out_infinite] motion-reduce:animate[bounce_10.5s_ease-in-out_infinite] w-[calc(40px+20%)] bottom-[40%] right-[15%]">
          <Image
            width={512}
            height={512}
            src="/images/octo-2.svg"
            alt="A happy bluish purple octo"
            priority={true}
          ></Image>
        </div>
        <div className="absolute animate-[bounce_5s_ease-in-out_infinite] motion-reduce:animate[bounce_10s_ease-in-out_infinite] w-[calc(40px+20%)] bottom-[20%] m-[auto] left-0 right-0">
          <Image
            width={512}
            height={512}
            src="/images/octo-1.svg"
            alt="A happy purple octo"
            priority={true}
          ></Image>
        </div>
      </div>

      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <h1
            className={`${ibmPlexMono.className} text-h2 text-white-100 font-medium`}
          >
            Are you lost?
          </h1>
          <p className="text-h4 font-normal">
            The page you you&#39;re looking page doesn&#39;t exist
          </p>
        </div>

        <BackButton />
      </div>
    </main>
  );
};

export default NotFound;
