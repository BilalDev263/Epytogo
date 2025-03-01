"use client";

import { Home } from "@/components/home/Home";
import { useStore } from "@/store/useStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const { setCurrentUser, currentUser } = useStore();

  useEffect(() => {
    if (session?.user) setCurrentUser(session?.user);
  }, []);

  return <Home />;
}
