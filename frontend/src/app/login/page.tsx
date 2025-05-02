import LoginFormWrapper from "@/components/Login/LoginFormWrapper";
import Link from "next/link";

export default function page() {
  return (
    <div className="flex items-center flex-col bg-black-300 gap-8  py-32 px-24">
      <div className="flex flex-col items-center">
        <h1 className="text-h3 text-white-100 font-bold">Welcome back!</h1>
        <p className="text-h5 text-white-200 font-medium">
          Log in to start chatting with your friends
        </p>
      </div>
      <LoginFormWrapper />
      <div className="flex justify-center items-end gap-4 text-h6">
        <p>Dont have an account yet?</p>
        <Link
          href={"/signup"}
          className=" flex text-white-200 items-center gap-4 border-b-[1px] py-1 px-2 border-b-white-100 font-medium hover:text-brand-4 hover:gap-6 transition-all"
        >
          Sign up <span className="forward-icon"></span>
        </Link>
      </div>
    </div>
  );
}
