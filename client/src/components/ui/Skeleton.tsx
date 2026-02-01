import type { ViewMode } from '../../types';

interface SkeletonProps {
  viewMode: ViewMode;
}

export function Skeleton({ viewMode }: SkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="skeleton w-12 h-12 rounded-lg mb-3" />
              <div className="skeleton w-24 h-4 rounded mb-2" />
              <div className="skeleton w-16 h-3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header skeleton */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
        <div className="col-span-6">
          <div className="skeleton w-16 h-4 rounded" />
        </div>
        <div className="col-span-2">
          <div className="skeleton w-10 h-4 rounded" />
        </div>
        <div className="col-span-2">
          <div className="skeleton w-10 h-4 rounded" />
        </div>
        <div className="col-span-2">
          <div className="skeleton w-16 h-4 rounded" />
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="grid grid-cols-12 gap-4 px-4 py-3 items-center"
        >
          <div className="col-span-6 flex items-center gap-3">
            <div className="skeleton w-5 h-5 rounded" />
            <div className="skeleton flex-1 h-4 rounded max-w-[200px]" />
          </div>
          <div className="col-span-2">
            <div className="skeleton w-16 h-4 rounded" />
          </div>
          <div className="col-span-2">
            <div className="skeleton w-12 h-4 rounded" />
          </div>
          <div className="col-span-2">
            <div className="skeleton w-20 h-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
