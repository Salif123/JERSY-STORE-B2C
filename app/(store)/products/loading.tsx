import React from 'react';

export default function ProductsLoading() {
  // Render a grid of 8 product card skeletons
  const skeletons = Array.from({ length: 8 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse bg-background">
      
      {/* Title block skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 dark:bg-navy-900 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-navy-950 rounded-lg" />
      </div>

      {/* Filters block skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-navy-950/30 border border-slate-200 dark:border-navy-900 p-4 rounded-2xl">
        <div className="h-10 bg-slate-200 dark:bg-navy-900 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-navy-900 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-navy-900 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-navy-900 rounded-xl" />
      </div>

      {/* Products Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col border border-slate-200 dark:border-navy-900 rounded-xl overflow-hidden bg-white dark:bg-navy-950 space-y-4 pb-4"
          >
            {/* Image block skeleton */}
            <div className="relative aspect-[4/5] w-full bg-slate-100 dark:bg-navy-900" />
            
            {/* Metadata skeletons */}
            <div className="px-4 space-y-2.5 flex-grow">
              <div className="h-3 w-16 bg-slate-200 dark:bg-navy-900 rounded-sm" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-navy-900 rounded-md" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-navy-900 rounded-sm" />
            </div>

            {/* Price & Action row skeleton */}
            <div className="px-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-navy-900 mt-auto">
              <div className="space-y-1">
                <div className="h-4 w-12 bg-slate-200 dark:bg-navy-900 rounded-sm" />
                <div className="h-3.5 w-8 bg-slate-100 dark:bg-navy-950 rounded-sm" />
              </div>
              <div className="h-9 w-9 bg-slate-200 dark:bg-navy-900 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
