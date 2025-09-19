import { cn } from "@/lib/utils";

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "group bg-white dark:bg-slate-800 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse",
        className,
      )}
    >
      {/* Image skeleton */}
      <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-200 dark:bg-gray-700"></div>

      {/* Content skeleton */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Title skeleton */}
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 sm:mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-4 w-3/4"></div>

        {/* Address skeleton */}
        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-24"></div>
        </div>
      </div>
    </div>
  );
};
