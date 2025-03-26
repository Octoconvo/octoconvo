"use client";

import { UserContext } from "@/contexts/user";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

const ProtectedRouteWrapper = ({
  route,
  children,
}: {
  route: string;
  children: React.ReactNode;
}) => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    console.log(user);
    if (user === false) router.push(route);
  }, [user, router, route]);

  return <>{children}</>;
};

export default ProtectedRouteWrapper;
