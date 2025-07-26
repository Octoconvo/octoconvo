"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useContext } from "react";
import { NotificationCountContext } from "@/contexts/notification";

const NotificationNav = () => {
  const path = usePathname();
  const { notificationCount } = useContext(NotificationCountContext);

  console.log({ path });
  return (
    <div className="relative">
      <Link
        data-testid="notification-l"
        href={`/lobby/notification`}
        className={
          "flex relative items-center justify-center h-12 rounded-[8px]" +
          " before:rounded-[8px] transition-all hover:transition-all" +
          " before:bg-gr-brand-1-2-1-3-d w-[48px] h-[48px] " +
          " before:hover:bg-gr-brand-1-2-1-d before:h-full before:w-full" +
          (path && path.split("/").includes("notification")
            ? " before:bg-gr-brand-1-3-d-1-b before:w-full before:h-full" +
              " before:rounded-[8px] before:scale-110 hover:shadow-none" +
              " hover:before:bg-gr-brand-1-2-3-d-1-t hover:before:scale-110"
            : "")
        }
      >
        <span
          className={
            "lobby-nav-icon" + " after:bg-[url(/images/notification-icon.svg)]"
          }
        ></span>
      </Link>
      {notificationCount ? (
        <div
          data-testid="nrd-ntfctn-cnt-indicator"
          className={
            "absolute right-0 top-0 flex justify-center items-center" +
            " bg-notification w-[36px] h-[36px] rounded-full" +
            " translate-y-[-50%] translate-x-[50%] animate-notification"
          }
        >
          <p className="text-white-100">{notificationCount}</p>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationNav;
