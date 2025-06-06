"use client";

import { useParams } from "next/navigation";
import Community from "@/components/Community/Community";

export default function Communities() {
  const params = useParams();

  return (
    <div className="w-full h-full bg-gr-black-1-b">
      <Community id={params.communityid ? (params.communityid as string) : null} />
    </div>
  );
}
