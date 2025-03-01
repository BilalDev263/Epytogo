// src/components/navigation/HomeNav.tsx - Version modernisée
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Fragment } from "react";
import { Tooltip } from "../ui/tooltip";
import { NavItem } from "./types";

export const Navigation = ({ navItems }: { navItems: NavItem[] }) => {
  const { itemId } = useStore();

  return (
    <nav className="flex justify-center gap-3 flex-wrap">
      {navItems?.map((item) => (
        <Fragment key={item.id}>
          {item.tooltip ? (
            <Tooltip key={item.id} content={item.name}>
              <button
                key={item.id}
                className={cn(
                  "group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105",
                  item.id === itemId 
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg" 
                    : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:shadow-md"
                )}
                type="button"
                onClick={item.handleClick}
              >
                <span className={cn(
                  "transition-all duration-300",
                  item.id === itemId ? "text-gray-900" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                )}>
                  {item.icon}
                </span>
              </button>
            </Tooltip>
          ) : (
            <button
              key={item.id}
              className={cn(
                "group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105",
                item.id === itemId 
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg" 
                  : "bg-gray-100 dark:bg-white/10 backdrop-blur-sm text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 hover:shadow-md border border-gray-200 dark:border-white/20"
              )}
              type="button"
              onClick={item.handleClick}
            >
              <span className={cn(
                "transition-all duration-300",
                item.id === itemId ? "text-gray-900" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
              )}>
                {item.icon}
              </span>
              <span className={cn(
                "hidden md:inline font-semibold tracking-tight transition-all duration-300",
                item.id === itemId ? "text-gray-900" : "text-gray-700 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
              )}>
                {item.name}
              </span>
            </button>
          )}
        </Fragment>
      ))}
    </nav>
  );
};