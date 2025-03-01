import { NavItem } from "@/components/navigation/types";
import { Profile } from "@/components/Profile";
import { useStore } from "@/store/useStore";
import {
  BedSingle,
  HomeIcon,
  LogOut,
  Star,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const { setItem } = useStore();
  const router = useRouter();

  const navItemsHomePage: NavItem[] = [
    {
      id: "all",
      name: "Tout rechercher",
      icon: <HomeIcon size={20} />,
      handleClick: () => {
        setItem("all");
      },
    },
    {
      id: "restaurant",
      name: "Restaurant",
      icon: <UtensilsCrossed size={20} />,
      handleClick: () => {
        setItem("restaurant");
      },
    },
    {
      id: "hotel",
      name: "Hotel",
      icon: <BedSingle size={20} />,
      handleClick: () => {
        setItem("hotel");
      },
    },
  ];

  const navItemsHeader: NavItem[] = [
    {
      id: "home",
      name: "Accueil",
      tooltip: true,
      icon: <HomeIcon size={20} />,
      handleClick: () => {
        setItem("home");
        router.push("/");
      },
    },
    {
      id: "profile",
      name: "Profil",
      tooltip: true,
      icon: <Profile trigger={<User size={20} />} />,
    },
    {
      id: "logout",
      name: "Déconnexion",
      tooltip: true,

      icon: <LogOut size={20} />,
      handleClick: async () => {
        setItem("logout");
        await signOut();
      },
    },
  ];

  return { navItemsHeader, navItemsHomePage };
};
