import Link from "next/link";
import InputWrapper from "@/components/InputWrapper";

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

      <form className="flex flex-col gap-8">
        <InputWrapper>
          {" "}
          <label htmlFor="username">Username</label>
          <input
            data-testid="username"
            name="username"
            id="username"
            required
            className="rounded-[8px] box-border py-1 px-2 text-black-300"
          ></input>
        </InputWrapper>
        <InputWrapper>
          {" "}
          <label htmlFor="password">Password</label>
          <input
            data-testid="password"
            name="password"
            id="password"
            required
            className="rounded-[8px] box-border py-1 px-2 text-black-300"
          ></input>
        </InputWrapper>

        <button className="text-h6 bg-brand-1 rounded-[8px] box-border py-1 px-2">
          Sign up
        </button>
        <div className="flex justify-center items-end gap-4 text-h6">
          <p>Already have an account?</p>
          <Link
            href={"/login"}
            className=" flex items-center gap-4 border-b-[1px] py-1 px-2 border-b-white-100 font-medium"
          >
            Log in <span className="forward-icon"></span>
          </Link>
        </div>
      </form>
    </div>
  );
}
