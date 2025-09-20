import React from 'react'

const PlatformStatistic = () => {
  return (
    <div className="mt-32 bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl">
    <div className="text-center mb-12">
      <h3 className="text-3xl font-bold text-gray-900 mb-4 font-space-grotesk">
        Platform <span className="text-[#28aeec]">Statistics</span>
      </h3>
      <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#28aeec] to-transparent mx-auto"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="text-center group">
        <div className="bg-gradient-to-br from-[#28aeec]/10 to-sky-400/10 rounded-2xl p-6 border border-[#28aeec]/20 hover:border-[#28aeec]/40 transition-all duration-300 hover:shadow-lg">
          <div className="text-4xl font-bold text-[#28aeec] mb-3 font-space-grotesk">
            {/* ${assetsData.reduce((sum, asset) => sum + asset.usdcValue, 0).toLocaleString()} */}
            60500

          </div>
          <div className="text-gray-600 font-semibold uppercase tracking-wide text-sm">Total Invested</div>
        </div>
      </div>

      <div className="text-center group">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
          <div className="text-4xl font-bold text-green-600 mb-3 font-space-grotesk">
            {/* {assetsData.length} */}
            300
          </div>
          <div className="text-gray-600 font-semibold uppercase tracking-wide text-sm">Active Projects</div>
        </div>
      </div>

      <div className="text-center group">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
          <div className="text-4xl font-bold text-purple-600 mb-3 font-space-grotesk">
            {/* {assetsData.reduce((sum, asset) => sum + asset.investorsCount, 0)} */}
            130
          </div>
          <div className="text-gray-600 font-semibold uppercase tracking-wide text-sm">Total Investors</div>
        </div>
      </div>

      <div className="text-center group">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-2xl p-6 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
          <div className="text-4xl font-bold text-orange-600 mb-3 font-space-grotesk">
            {/* {(assetsData.reduce((sum, asset) => sum + asset.annualYield, 0) / assetsData.length).toFixed(1)}% */}
            15.5
          </div>
          <div className="text-gray-600 font-semibold uppercase tracking-wide text-sm">Avg. Annual Yield</div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default PlatformStatistic
