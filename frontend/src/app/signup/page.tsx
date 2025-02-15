import SignupFormWrapper from "@/components/SignupFormWrapper";
import Link from "next/link";

export default function page() {
  return (
    <div className="flex items-center flex-col bg-black-300 gap-8  py-32 px-24">
      <div className="flex flex-col items-center">
        <h1 className="text-h3 text-white-100 font-bold">
          Welcome to Octoconvo
        </h1>
        <p className="text-h5 text-white-100 font-medium">
          Create an account to start your journey
        </p>
      </div>
      <SignupFormWrapper />
      <div className="flex justify-center items-end gap-4 text-h6">
        <p>Already have an account?</p>
        <Link
          href={"/login"}
          className=" flex items-center gap-4 border-b-[1px] py-1 px-2 border-b-white-100 font-medium hover:text-brand-4 hover:gap-6 transition-all"
        >
          Log in <span className="forward-icon"></span>
        </Link>
      </div>
    </div>
  );
}
