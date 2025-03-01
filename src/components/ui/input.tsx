import * as React from "react";

import { cn } from "@/lib/utils";
import { MailIcon, PasswordIcon, SearchIcon } from "./iconsform";

const InputRoot = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-border focus:border-sky-600/50 px-3 py-2 text-[13px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:opacity-50 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    />
  );
});

InputRoot.displayName = "InputRoot";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    icon?: "mail" | "password" | "search";
    type: "text" | "email" | "password" | "search";
    iconClassName?: string;
  }
>(({ className, type, label, error, icon, iconClassName, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <div className="relative flex flex-col w-full">
      {label && (
        <label className="text-sm" htmlFor={label}>
          {label}
        </label>
      )}

      <div className="relative">
        <InputRoot
          ref={ref}
          {...props}
          className={cn(
            "border-border w-full rounded-md border py-2 pl-3 pr-8 text-sm/6",
            "dark:bg-card focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 placeholder:text-placeholder",
            className,
            {
              "border-error-outline": error,
            },
          )}
          type={type === "password" && isVisible ? "text" : type}
        />
        {type === "password" && (
          <PasswordIcon
            className={cn(iconClassName, {
              "text-error": error,
            })}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
          />
        )}

        {type === "email" && (
          <MailIcon
            className={cn(iconClassName, {
              "text-error": error,
            })}
          />
        )}
        {type === "search" && <SearchIcon className={iconClassName} />}
      </div>
      {error && <p className={cn("text-error text-xs")}>{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
