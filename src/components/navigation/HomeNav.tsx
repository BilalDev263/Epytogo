import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Fragment } from "react";
import { Tooltip } from "../ui/tooltip";
import { NavItem } from "./types";

export const Navigation = ({ navItems }: { navItems: NavItem[] }) => {
  const { itemId } = useStore();

  return (
    <nav className="flex justify-center gap-2 flex-wrap">
      {navItems?.map((item) => (
        <Fragment key={item.id}>
          {item.tooltip ? (
            <Tooltip key={item.id} content={item.name}>
              <button
                key={item.id}
                className={cn(
                  "flex cursor-pointer items-center gap-1 hover:opacity-80 p-2 md:p-3 rounded-md",
                  { "text-[#fed34f]": item.id === itemId }
                )}
                type="button"
                onClick={item.handleClick}
              >
                {item.icon}
              </button>
            </Tooltip>
          ) : (
            <button
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center gap-1 hover:opacity-80 p-2 md:p-3 rounded-md",
                { "text-[#fed34f]": item.id === itemId }
              )}
              type="button"
              onClick={item.handleClick}
            >
              {item.icon}
              <p className="hidden md:inline font-semibold tracking-tight">
                {" "}
                {item.name}
              </p>
            </button>
          )}
        </Fragment>
      ))}
    </nav>
  );
};
