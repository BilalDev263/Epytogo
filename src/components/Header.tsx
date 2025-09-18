"use client";

import { Navigation } from "./navigation/HomeNav";
import Container from "./ui/container";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useNavigation } from "@/hooks/useNavigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import AdminButton from "./admin/AdminButton";
import EstablishmentButton from "./establishment/EstablishmentButton";
import ProfileButton from "./profile/ProfileButton";

export const Header = () => {
  const { navItemsHeader } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all duration-300 shadow-sm">
      <Container className="flex h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-12 h-12 epytogo-gradient rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
            <Image
              src="/logo.png"
              alt="Epytogo Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Epytogo</span>
            <span className="text-xs text-gray-600 dark:text-gray-500 hidden md:block">Découvrez l'Égypte</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Navigation navItems={navItemsHeader} />
          <ProfileButton />
          <EstablishmentButton />
          <AdminButton />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ProfileButton />
          <EstablishmentButton />
          <AdminButton />
          <ThemeToggle />
          <button
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 md:hidden">
            <div className="container mx-auto px-4 py-6">
              <Navigation navItems={navItemsHeader} />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};