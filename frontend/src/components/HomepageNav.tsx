import Link from "next/link";

const HomepageNav = () => {
  return (
    <nav className="flex justify-between items-center gap-4">
      <Link className="text-h6 font-medium" href="/signup">
        Sign up
      </Link>
      <Link className="text-h6 font-medium" href="/login">
        Log in
      </Link>
    </nav>
  );
};

export default HomepageNav;
