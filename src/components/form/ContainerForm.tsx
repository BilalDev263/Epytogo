import { cn } from "@/lib/utils";
import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}>;
export const ContainerForm = ({ className, handleSubmit, children }: Props) => {
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-4 p-6 items-center justify-center text-muted-foreground m-4 ",
        className,
      )}
    >
      {children}
    </form>
  );
};
