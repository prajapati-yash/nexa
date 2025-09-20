"use client";

const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="group relative">
          {/* Card Container */}
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-lg h-[340px]">

            {/* Background Image Skeleton */}
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>

            {/* Default State - Only Title Skeleton */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="h-8 bg-white/30 rounded-lg animate-pulse mb-2"></div>
                <div className="h-6 bg-white/20 rounded-lg animate-pulse w-3/4"></div>
              </div>
            </div>

            {/* Corner Badge Skeleton - Status */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-gray-400/50 px-3 py-1 rounded-full">
                <div className="h-3 w-16 bg-white/30 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Hover overlay skeleton elements */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-50">
              {/* Top Content Skeleton */}
              <div className="space-y-3">
                {/* Title */}
                <div className="h-6 bg-white/20 rounded animate-pulse"></div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-white/15 rounded animate-pulse"></div>
                  <div className="h-4 bg-white/15 rounded animate-pulse w-4/5"></div>
                </div>

                {/* Location */}
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse mr-2"></div>
                  <div className="h-4 bg-white/20 rounded animate-pulse w-24"></div>
                </div>
              </div>

              {/* Bottom Content Skeleton */}
              <div className="space-y-4">
                {/* Metrics Box */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-2 px-3 border border-white/30">
                  {/* Yield Row */}
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-white/20 rounded animate-pulse mr-2"></div>
                      <div className="h-4 bg-white/20 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="h-5 bg-white/20 rounded animate-pulse w-10"></div>
                  </div>

                  <div className="h-px bg-white/30 my-1"></div>

                  {/* Boring Index Row */}
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse mr-2"></div>
                      <div className="h-4 bg-white/20 rounded animate-pulse w-14"></div>
                    </div>
                    <div className="h-5 bg-white/20 rounded animate-pulse w-8"></div>
                  </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-3 px-6">
                  <div className="h-4 bg-white/20 rounded animate-pulse mx-auto w-24"></div>
                </div>
              </div>
            </div>

            {/* Pulse animation overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;