import { cn } from "@/lib/utils";

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "relative flex animate-pulse cursor-pointer justify-center border border-border bg-gray-200/50 shadow-md transition-opacity hover:opacity-90",
        className,
      )}
    />
  );
};
