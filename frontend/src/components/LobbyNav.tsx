"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LobbyNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={
        "flex flex-col justify-between h-full bg-black-100 py-12" + " px-4"
      }
    >
      <div className="flex flex-col justify-between gap-8">
        <Link
          href={`${pathname}\\friends`}
          className={
            "flex relative items-center justify-center h-12 transition-all" +
            " hover:transition-all hover:shadow-[0_0.1rem_0_0_var(--white-200)]"
          }
        >
          <span
            className={
              "lobby-nav-icon" + " after:bg-[url(/images/friends-icon.svg)]"
            }
          ></span>
        </Link>
        <Link
          href={`${pathname}\\dm`}
          className={
            "flex relative items-center justify-center h-12 translation-all" +
            " hover:transition-all hover:shadow-[0_0.1rem_0_0_var(--white-200)]"
          }
        >
          <span
            className={
              "lobby-nav-icon" + " after:bg-[url(/images/dm-icon.svg)]"
            }
          ></span>
        </Link>
        <Link
          href={`${pathname}\\communities`}
          className={
            "flex relative items-center justify-center h-12 translation-all" +
            " hover:transition-all hover:shadow-[0_0.1rem_0_0_var(--white-200)]"
          }
        >
          <span
            className={
              "lobby-nav-icon" + " after:bg-[url(/images/communities-icon.svg)]"
            }
          ></span>
        </Link>
        <Link
          href={`${pathname}//communities//create`}
          className={
            "flex relative items-center justify-center h-12 before:bg-brand-1" +
            " before:w-full before:h-full before:rounded-full transition-all" +
            " hover:transition-all hover:before:scale-105" +
            " hover:before:rounded-[1rem]"
          }
        >
          <span
            className={
              "lobby-nav-icon" + " after:bg-[url(/images/add-icon.svg)]"
            }
          ></span>
        </Link>
        <Link
          href={`${pathname}\\explore`}
          className={
            "flex relative items-center justify-center h-12 before:bg-brand-1" +
            " before:rounded-full transition-all hover:transition-all" +
            " hover:before:scale-105 before:w-full before:h-full" +
            " hover:before:rounded-[1rem]"
          }
        >
          <span
            className={
              "lobby-nav-icon after:bg-[url(/images/explore-icon.svg)]"
            }
          ></span>
        </Link>
      </div>

      <button className="rounded-full h-[3rem] w-[3rem] bg-grey-200"></button>
    </nav>
  );
};

export default LobbyNav;
