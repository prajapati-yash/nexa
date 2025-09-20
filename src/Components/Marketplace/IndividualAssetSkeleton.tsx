"use client";

const IndividualAssetSkeleton = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute top-[15%] right-[8%] w-[300px] h-[300px] bg-[#28aeec]/20 blur-3xl opacity-60 rounded-full z-0" />
      <div className="absolute bottom-[25%] left-[5%] w-[250px] h-[250px] bg-sky-400/30 blur-3xl opacity-80 rounded-full z-0" />
      <div className="absolute top-[45%] left-[12%] w-[180px] h-[180px] bg-sky-300/25 blur-3xl opacity-70 rounded-full z-0" />
      <div className="absolute bottom-[5%] right-[15%] w-[200px] h-[200px] bg-[#28aeec]/15 blur-3xl opacity-50 rounded-full z-0" />

      <div className="relative z-10">
        {/* Hero Section Skeleton */}
        <div className="relative h-[70vh] min-h-[550px] overflow-hidden">
          {/* Background Image Skeleton */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

          {/* Content overlay skeleton */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-20">
              <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl space-y-6">
                  {/* Status Badge Skeleton */}
                  <div className="flex gap-1">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                      <div className="h-4 w-12 bg-white/30 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                      <div className="h-4 w-16 bg-white/30 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Title Skeleton */}
                  <div className="space-y-4">
                    <div className="h-12 bg-white/30 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-white/20 rounded-lg animate-pulse w-4/5"></div>
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-3">
                    <div className="h-6 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-6 bg-white/20 rounded animate-pulse w-5/6"></div>
                    <div className="h-6 bg-white/20 rounded animate-pulse w-3/4"></div>
                  </div>

                  {/* Location Skeleton */}
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse mr-3"></div>
                    <div className="h-5 bg-white/20 rounded animate-pulse w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Funding Progress Bar Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                <div className="text-right space-y-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-white/80 rounded-full h-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-3/5 animate-pulse"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Investment Details Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                {/* Investment Calculator Skeleton */}
                <div className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-32"></div>
                  </div>

                  <div className="flex w-full gap-8">
                    {/* Token Selection Skeleton */}
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="size-10 rounded-full bg-gray-300 animate-pulse"></div>
                          <div className="flex-1 text-center space-y-2">
                            <div className="h-6 bg-gray-300 rounded animate-pulse mx-auto w-12"></div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-16"></div>
                          </div>
                          <div className="size-10 rounded-full bg-gray-300 animate-pulse"></div>
                        </div>

                        <div className="mt-4 text-center space-y-2">
                          <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-20"></div>
                          <div className="h-6 bg-gray-300 rounded animate-pulse mx-auto w-24"></div>
                        </div>
                      </div>
                    </div>

                    {/* Total Value Skeleton */}
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl py-11 p-6 border border-gray-200">
                        <div className="text-center space-y-2">
                          <div className="h-10 bg-gray-300 rounded animate-pulse mx-auto w-32"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Button Skeleton */}
                  <div className="mt-8">
                    <div className="w-full bg-gray-200 rounded-2xl py-4 px-8 animate-pulse">
                      <div className="h-5 bg-gray-300 rounded animate-pulse mx-auto w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Why This Works Skeleton */}
                <div className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8">
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                    <div className="size-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Asset Overview Skeleton */}
              <div className="bg-black/5 rounded-3xl border border-gray-200 shadow-lg p-8 h-fit sticky top-8">
                <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                  <div className="size-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Performance Metrics Skeleton */}
                  <div className="flex items-start justify-between">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="text-right space-y-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Additional sections */}
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 text-center space-y-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-8"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center space-y-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualAssetSkeleton;