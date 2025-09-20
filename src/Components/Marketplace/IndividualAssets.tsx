"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getAssetById, assetsData, formatNextPayout, Asset } from '@/Utils/AssetsData';
import {
  FiMapPin,
  FiTarget,
  FiClock,
  FiZap,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiFileText,
  FiMinus,
  FiPlus
} from 'react-icons/fi';
import { BsLightning, BsCopy } from 'react-icons/bs';
import { IoCheckmarkCircle } from 'react-icons/io5';

const IndividualAssets = () => {
    const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [totalValue, setTotalValue] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.title) {
      // Convert URL-encoded title back to readable format and find matching asset
      const decodedTitle = decodeURIComponent(params.title as string);
      const foundAsset = assetsData.find(a => {
        const urlTitle = a.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return urlTitle === decodedTitle.toLowerCase() || a.id === decodedTitle;
      });
      setAsset(foundAsset || null);
    }
  }, [params.title]);

  useEffect(() => {
    if (asset) {
      setTotalValue(tokenQuantity * asset.minimumInvestment);
    }
  }, [tokenQuantity, asset]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, tokenQuantity + change);
    setTokenQuantity(newQuantity);
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!asset) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#28aeec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins">Loading asset details...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute top-[15%] right-[8%] w-[300px] h-[300px] bg-[#28aeec]/20 blur-3xl opacity-60 rounded-full z-0" />
      <div className="absolute bottom-[25%] left-[5%] w-[250px] h-[250px] bg-sky-400/30 blur-3xl opacity-80 rounded-full z-0" />
      <div className="absolute top-[45%] left-[12%] w-[180px] h-[180px] bg-sky-300/25 blur-3xl opacity-70 rounded-full z-0" />
      <div className="absolute bottom-[5%] right-[15%] w-[200px] h-[200px] bg-[#28aeec]/15 blur-3xl opacity-50 rounded-full z-0" />

      <div className="relative z-10">
        {/* Hero Section with Main Image and Title/Description Overlay */}
        <div className="relative h-[70vh] min-h-[530px] overflow-hidden">
          <Image
            src={asset.mainImage}
            alt={asset.title}
            fill
            className="object-cover"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-3xl"
                >
                  {/* Status Badge */}
                  <div className="mb-6">
                    <span className={`font-poppins uppercase inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                      asset.status === 'active' ? 'bg-green-500' :
                      asset.status === 'upcoming' ? 'bg-[#28aeec]' :
                      asset.status === 'funded' ? 'bg-blue-500' : 'bg-gray-500'
                    } text-white`}>
                      <BsLightning className="w-4 h-4 mr-2" />
                      {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-space-grotesk mb-6 leading-tight">
                    {asset.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-white/90 font-poppins leading-relaxed mb-8 max-w-2xl">
                    {asset.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-white/80 text-lg">
                    <FiMapPin className="w-6 h-6 mr-3 text-[#28aeec]" />
                    <span className="font-semibold">{asset.location}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">Funding Progress</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#28aeec]">{asset.fundingProgress}%</div>
                  <div className="text-sm text-gray-600">${asset.totalRequired.toLocaleString()} target</div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${asset.fundingProgress}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>${(asset.totalRequired * asset.fundingProgress / 100).toLocaleString()} raised</span>
                  <span>{asset.investorsCount} investors</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column - Investment Details */}
              <div className="lg:col-span-2 space-y-8">

                {/* Token Pricing Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">Investment Calculator</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Number of Tokens</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-3xl font-bold text-gray-900">{tokenQuantity}</div>
                          <div className="text-sm text-gray-500">tokens</div>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-600">Price per token</div>
                        <div className="text-xl font-bold text-[#28aeec]">${asset.minimumInvestment} USDC</div>
                      </div>
                    </div>

                    {/* Total Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Total Investment</label>
                      <div className="bg-gradient-to-r from-[#28aeec]/10 to-sky-400/10 rounded-2xl p-6 border border-[#28aeec]/20">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-[#28aeec] mb-2">${totalValue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">USDC</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Button */}
                  <div className="mt-8">
                    <button className="w-full bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#28aeec]/40 font-poppins uppercase tracking-wide">
                      Invest ${totalValue.toLocaleString()} USDC
                    </button>
                  </div>
                </motion.div>

                {/* Why This Works Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">Why This Works</h3>
                  </div>

                  <div className="space-y-4">
                    {asset.whyThisWorks.map((point: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IoCheckmarkCircle className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700 font-poppins leading-relaxed">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Location Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">Location</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Map placeholder */}
                    <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FiMapPin className="w-12 h-12 mx-auto mb-2" />
                        <p>Interactive Map</p>
                        <p className="text-sm">Lat: {asset.locationOnMap.lat}</p>
                        <p className="text-sm">Lng: {asset.locationOnMap.lng}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-900 font-poppins">{asset.locationOnMap.address}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-900 font-poppins">{asset.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Metrics & Info */}
              <div className="space-y-8">

                {/* Next Payout */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiClock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Next Payout</h3>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#28aeec] mb-2">
                      {formatNextPayout(asset.nextPayout)}
                    </div>
                    <p className="text-sm text-gray-600">Until next distribution</p>
                  </div>
                </motion.div>

                {/* Historical Yields */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiTrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Historical Yields</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Yield</span>
                      <span className="font-bold text-green-600">{asset.annualYield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last 12 Months</span>
                      <span className="font-bold text-green-600">{(asset.annualYield - 1.2).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last 6 Months</span>
                      <span className="font-bold text-green-600">{(asset.annualYield + 0.8).toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>

                {/* Boring Index */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Boring Index</h3>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {asset.boringIndex}/10
                    </div>
                    <p className="text-sm text-gray-600">Lower = More Stable</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(asset.boringIndex / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Power Saved */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                      <FiZap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Environmental Impact</h3>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {asset.powerSaved.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{asset.powerSaved.unit}</div>
                    <p className="text-xs text-gray-500">Saved monthly</p>
                  </div>
                </motion.div>

                {/* Smart Contract */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                      <FiShield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Smart Contract</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 overflow-hidden">
                          {asset.smartContractAddress.slice(0, 10)}...{asset.smartContractAddress.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyAddress(asset.smartContractAddress)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <BsCopy className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    {copied && (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <IoCheckmarkCircle className="w-3 h-3" />
                        Copied to clipboard
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Proof Document */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-full flex items-center justify-center">
                      <FiFileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Documentation</h3>
                  </div>

                  <a
                    href={asset.proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-orange-500/10 to-red-400/10 hover:from-orange-500/20 hover:to-red-400/20 border border-orange-500/20 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiFileText className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{asset.proof.fileName}</div>
                        <div className="text-xs text-gray-500">Business Plan & Proof</div>
                      </div>
                    </div>
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndividualAssets
