"use client";

import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <button className="back-button" onClick={() => router.back()}>
      <span className="back-button-icon"></span>
      Go back
    </button>
  );
};

export default BackButton;
