import { cn } from "@/lib/utils";
import { Eye, EyeOff, LucideMail, LucideSearch } from "lucide-react";

export const PasswordIcon = ({
  className,
  setIsVisible,
  isVisible,
  iconSize = 18,
}: {
  className?: string;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible: boolean;
  iconSize?: number;
}) => {
  const togglePasswordVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div
      className={cn({
        "eye-icon-on": isVisible,
        "eye-icon-of": !isVisible,
      })}
      data-testid="eye-icon"
      role="button"
      tabIndex={0}
      onClick={togglePasswordVisibility}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          togglePasswordVisibility();
        }
      }}
    >
      {isVisible ? (
        <Eye
          size={iconSize}
          className={cn("text-muted-foreground right-3 absolute", className)}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        />
      ) : (
        <EyeOff
          size={iconSize}
          className={cn("text-muted-foreground right-3 absolute", className)}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        />
      )}
    </div>
  );
};

export const SearchIcon = ({
  className,
  iconSize = 18,
}: {
  className?: string;
  iconSize?: number;
}) => (
  <LucideSearch
    size={iconSize}
    aria-label="Search"
    className={cn("text-muted-foreground right-3", className, "absolute")}
    data-testid="search-icon"
    style={{ top: "50%", transform: "translateY(-50%)" }}
  />
);

export const MailIcon = ({
  className,
  iconSize = 18,
}: {
  className?: string;
  iconSize?: number;
}) => (
  <LucideMail
    size={iconSize}
    aria-label="Email"
    className={cn("text-muted-foreground right-3", className, "absolute")}
    data-testid="mail-icon"
    style={{ top: "50%", transform: "translateY(-50%)" }}
  />
);
