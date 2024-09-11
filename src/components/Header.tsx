"use client";

import { Navigation } from "./navigation/HomeNav";
import Container from "./ui/container";
import { useNavigation } from "@/hooks/useNavigation";
import Image from "next/image";

export const Header = () => {
  const { navItemsHeader } = useNavigation();

  return (
    <Container className="mb-10 flex h-16 items-center justify-between px-4 md:px-8">
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={50}
          height={50}
          className="h-auto w-auto"
        />
      </div>
      <nav className="flex items-center gap-4">
        <Navigation navItems={navItemsHeader} />
      </nav>
    </Container>
  );
};
