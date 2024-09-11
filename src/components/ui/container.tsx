import { PropsWithChildren, forwardRef } from "react";
import { cn } from "../../lib/utils";

type Props = PropsWithChildren<{
  className?: string;
}>;

const Container = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-4/6 mx-auto ", className)} {...props}>
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";

export default Container;
