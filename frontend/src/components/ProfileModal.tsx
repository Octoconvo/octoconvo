"use client";

import Image from "next/image";

const ProfileModal = () => {
  return (
    <dialog
      className={
        "absolute left-[calc(100%+1rem)] bottom-[1rem] bg-black-200 " +
        "rounded-[8px]"
      }
      open
    >
      <div
        className={
          "bg-black-400 w-[480px] rounded-[inherit] border-b-solid " +
          "border-b-brand-3 border-b-8"
        }
      >
        <article className="rounded-[inherit]">
          <figure className="h-[125px] bg-brand-1 rounded-t-[inherit]"></figure>
          <section className="relative flex flex-col gap-4 bg-black-200 p-8">
            <header>
              <figure
                className={
                  "absolute p-2 top-[calc(-32px-0.25rem)] bg-black-200 " +
                  " min-w-[64px] min-h-[64px] rounded-full"
                }
              >
                <Image
                  src=""
                  width={64}
                  height={64}
                  className="rounded-full bg-brand-4 min-w-[64px] min-h-[64px]"
                  alt="User avatar"
                ></Image>
              </figure>
              <div className="flex justify-end">
                <button
                  data-testid="main-btn"
                  className={
                    "bg-grey-100 text-white-100 py-1 px-4 rounded-[4px] " +
                    "font-normal leading-normal " +
                    "hover:bg-brand-1"
                  }
                >
                  Edit Profile
                </button>
              </div>
              <h1 className="text-h6 text-white-100 font-regular leading-normal">
                Adrian Archer
              </h1>
              <p className="text-s font-bold leading-normal text-white-200">
                @adrianarcher
              </p>
            </header>
            <p className="text-white-200 leading-normal text-p">
              I love hiking and swimming. Venturing through nature is something
              I love doing, my dream is to backpack through europe and have fun
              adventures exploring the beautiful forests and jungles.
            </p>
            <footer>
              <p className="text-brand-3 text-s leading-normal">Member since</p>
              <p className="text-white-200 text-s leading-normal font-extralight">
                August 17 2024
              </p>
            </footer>
          </section>
        </article>
        <div className="flex flex-col gap-4 p-8 rounded-[inherit]">
          <div>
            <button className="bg-grey-100 py-2 px-4 text-white-100 rounded-[4px]">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileModal;
