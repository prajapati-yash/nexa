"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { assetsData, formatNextPayout, categories, Asset } from '@/Utils/AssetsData';
import { FiTarget, FiMapPin, FiClock, FiZap, FiRefreshCw } from 'react-icons/fi';
import { BsLightning } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { useContractData, useWallet, useBusinessActions } from '@/hooks/useContractData';
import SkeletonLoader from './SkeletonLoader';

const Marketplace = () => {
  const router = useRouter();
  const { assets, loading, error, refreshData } = useContractData();
  const { connected, connectWallet } = useWallet();
  const { investInBusiness } = useBusinessActions();
  const [showStaticData, setShowStaticData] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Active', color: 'bg-green-500' },
      funded: { text: 'Funded', color: 'bg-blue-500' },
      upcoming: { text: 'UpComing', color: 'bg-[#28aeec]' },
      completed: { text: 'Completed', color: 'bg-gray-500' }
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const handleAssetClick = (asset: Asset) => {
    // Convert title to URL-friendly format
    const urlTitle = asset.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    router.push(`/marketplace/${urlTitle}`);
  };

  const handleInvestClick = async (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!connected) {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        return;
      }
    }

    // Extract business ID from asset ID
    const businessId = parseInt(asset.id.replace('business-', ''));
    
    try {
      const txHash = await investInBusiness(businessId, '0.001'); // 0.001 ETH investment
      console.log('Investment successful:', txHash);
      // Refresh data after successful investment
      refreshData();
    } catch (error) {
      console.error('Investment failed:', error);
    }
  };

  // Combine contract data with static data if needed
  // const displayAssets = showStaticData ? [...assets, ...assetsData] : assets;
  const displayAssets =  [...assets];

  return (
    <section className="min-h-screen bg-white py-28 relative overflow-hidden">
      {/* Background gradient overlays - repositioned from ValueProposition */}
      <div className="absolute top-[15%] right-[8%] w-[300px] h-[300px] bg-[#28aeec]/30 blur-3xl opacity-60 rounded-full z-0" />
      <div className="absolute bottom-[25%] left-[5%] w-[250px] h-[250px] bg-sky-400/40 blur-3xl opacity-80 rounded-full z-0" />
      <div className="absolute top-[45%] left-[12%] w-[180px] h-[180px] bg-sky-300/35 blur-3xl opacity-70 rounded-full z-0" />
      <div className="absolute bottom-[5%] right-[15%] w-[200px] h-[200px] bg-[#28aeec]/25 blur-3xl opacity-50 rounded-full z-0" />
      <div className="absolute top-[8%] left-[25%] w-[120px] h-[120px] bg-sky-500/30 blur-3xl opacity-60 rounded-full z-0" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          {/* Number + Label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
              <BsLightning />
            </div>
            <span className="uppercase text-3xl tracking-wider text-[#28aeec] font-semibold font-space-grotesk">
            Investment Marketplace
            </span>
            <button
              onClick={refreshData}
              className="ml-auto p-2 rounded-full bg-[#28aeec]/10 hover:bg-[#28aeec]/20 transition-colors"
              title="Refresh data from blockchain"
            >
              <FiRefreshCw className={`w-5 h-5 text-[#28aeec] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-sky-400/50 via-sky-200/50 to-transparent mb-6"></div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold uppercase font-space-grotesk leading-tight text-gray-900">
          Invest Smart. <br />
          <span className="text-[#28aeec]">Build Tomorrow.</span>
          </h2>

          {/* Data Source Toggle */}
          {/* <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => setShowStaticData(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !showStaticData 
                  ? 'bg-[#28aeec] text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Blockchain Data ({assets.length})
            </button>
            <button
              onClick={() => setShowStaticData(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showStaticData 
                  ? 'bg-[#28aeec] text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Demo Data ({assetsData.length})
            </button>
          </div> */}

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </motion.div>

        

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Assets Grid - Two Column with Hover Reveal */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayAssets.map((asset, index) => {

            return (
              <div
                key={asset.id}
                className="group relative cursor-pointer"
                onClick={() => handleAssetClick(asset)}
              >
                {/* Card Container */}
                <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden hover:border-[#28aeec]/60 hover:shadow-2xl hover:shadow-[#28aeec]/25 transition-all duration-500 shadow-lg hover:bg-white/80 transform hover:-translate-y-2 hover:scale-[1.02] h-[340px]">

                  {/* Background Image - Always Visible */}
                  <div className="absolute inset-0">
                    <Image
                      src={asset.image}
                      alt={asset.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:blur-sm group-hover:scale-110"
                    />
                    {/* Gradient Overlay - Changes on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-500"></div>
                  </div>

                  {/* Default State - Only Title */}
                  <div className="absolute inset-0 transition-all duration-500 group-hover:opacity-0">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white font-space-grotesk leading-tight drop-shadow-lg">
                        {asset.title}
                      </h3>
                    </div>
                  </div>

                  {/* Hover State - Content Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-between">

                    {/* Top Content */}
                    <div className="space-y-3">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-white font-space-grotesk leading-tight drop-shadow-lg">
                        {asset.title}
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed font-poppins drop-shadow line-clamp-2">
                        {asset.description}
                      </p>

                      {/* Location */}
                      <div className="flex items-center text-white/80 text-sm">
                        <FiMapPin className="w-4 h-4 mr-2 text-[#28aeec] drop-shadow" />
                        <span className="font-semibold drop-shadow">{asset.location}</span>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="space-y-4">
                      {/* Metrics */}
                      <div className="bg-transparent backdrop-blur-sm rounded-2xl py-2 px-3 border border-white/30">
                        <div className="flex justify-between items-center py-1">
                          <div className="flex items-center">
                            <FiTarget className="w-4 h-4 text-[#28aeec] mr-2" />
                            <span className="text-sm font-semibold text-white uppercase">Yield</span>
                          </div>
                          <div className="text-lg font-bold text-[#28aeec]">
                            {asset.annualYield}%
                          </div>
                        </div>

                        <div className="h-px bg-white/30 my-1"></div>

                        <div className="flex justify-between items-center py-1">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-800 rounded-full mr-2 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm font-semibold text-white uppercase">Boring</span>
                          </div>
                          <div className="text-lg font-bold text-white">
                            {asset.boringIndex}/10
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (asset.id.startsWith('business-')) {
                            handleInvestClick(asset, e);
                          } else {
                            handleAssetClick(asset);
                          }
                        }}
                        className="w-full bg-white/20 border-2 border-[#28aeec] hover:bg-[#28aeec]/20 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#28aeec]/40 font-poppins uppercase tracking-wide text-sm backdrop-blur-sm cursor-pointer"
                      >
                        {asset.id.startsWith('business-') ? (
                          asset.status === 'active' ? 'Invest Now' :
                          asset.status === 'funded' ? 'View Tokens' :
                          asset.status === 'upcoming' ? 'Join Waitlist' : 'Learn More'
                        ) : (
                          asset.status === 'active' ? 'Back Business' :
                          asset.status === 'upcoming' ? 'Join Waitlist' :
                          asset.status === 'funded' ? 'Funded' : 'Learn More'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Corner Badge - Status */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`${getStatusBadge(asset.status).color} text-white px-3 py-1 rounded-full text-xs font-space-grotesk uppercase font-bold`}>
                      {getStatusBadge(asset.status).text}
                    </div>
                  </div>

                  {/* Corner Badge - Category */}
                  {/* <div className="absolute top-4 left-4 z-10">
                    <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                      <BsLightning className="w-3 h-3 inline mr-1" />
                      {asset.category}
                    </div>
                  </div> */}

                  {/* Decorative Border on Hover */}
                  <div className="absolute inset-0 border-2 border-[#28aeec] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {!loading && displayAssets.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <FiTarget className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              {showStaticData ? 'No demo assets found' : 'No blockchain assets found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {showStaticData 
                ? 'Demo data is not available.' 
                : 'No businesses have been submitted to the blockchain yet. Be the first to submit a business!'
              }
            </p>
            {!showStaticData && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Contract Addresses on Arbitrum Sepolia:
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Registry: 0x29bFC7c1509461CF7aC8822Fdcc77E126FE0cD96</p>
                  <p>Minter: 0x0c461AB30b13096d26Fd794CEfFE6Ef0f936C42b</p>
                  <p>YieldDistributor: 0x8cb8f87896e46069DACe1b9d962C7A301AC502a6</p>
                </div>
                <button
                  onClick={() => setShowStaticData(true)}
                  className="px-6 py-3 bg-[#28aeec] text-white rounded-lg hover:bg-[#28aeec]/80 transition-colors"
                >
                  View Demo Data Instead
                </button>
              </div>
            )}
          </div>
        )}
       
      </div>
    </section>
  );
};

export default Marketplace;
