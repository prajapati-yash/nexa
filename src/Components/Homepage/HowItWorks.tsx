"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiDollarSign, FiTruck, FiCreditCard, FiTrendingUp } from "react-icons/fi";
import step1 from "@/app/assets/connectwallet.png";
import step2 from "@/app/assets/selectassets.png";
import step3 from "@/app/assets/commitfunds.png";
import step4 from "@/app/assets/recieveyields.png";
import { LuWorkflow } from "react-icons/lu";
import Image from "next/image";
import { RiWalletLine } from "react-icons/ri";
import { FaGem } from "react-icons/fa";

const HowItWorks = () => {
  const [expandedStep, setExpandedStep] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    const images = [step1, step2, step3, step4];
    const imagePromises = images.map((src) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src.src;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  const steps = [
    {
      id: 1,
      title: "Connect Wallet",
      description: "Securely connect your Web3 wallet to the NEXA platform on the Arbitrum ecosystem.",
      icon: RiWalletLine, // or FiCreditCard, MdOutlineAccountBalanceWallet
      image:step1
    },
    {
      id: 2,
      title: "Select Asset",
      description: "Browse a curated list of tokenized real-world assets, such as laundromats and vending machines.",
      icon: FaGem, // or FaRegEye, FiSearch
      image:step2
    },
    {
      id: 3,
      title: "Commit Funds",
      description: "Invest your crypto assets by committing funds to your chosen business's smart contract.",
      icon: FiDollarSign, // or FiSend, FaHandHoldingUsd
      image:step3
    },
    {
      id: 4,
      title: "Receive Yields",
      description: "Earn automated and transparent revenue shares directly in your wallet as the business generates income.",
      icon: FiTrendingUp, // or RiCoinsLine, FaChartLine
      image:step4
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      {/* Sky blue dots at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] pointer-events-none z-0">
        <div className="relative w-full h-full">
          {/* Create a grid of dots with opacity gradient */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, #28aeec66 1px, transparent 1px)`,
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0",
              opacity: 1,
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Number + Label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
              <LuWorkflow />
            </div>
            <span className="uppercase text-3xl tracking-wider text-[#28aeec] font-semibold font-space-grotesk">
              How It Works
            </span>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-sky-400/50 via-sky-200/50 to-transparent mb-6"></div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold uppercase font-space-grotesk leading-tight text-gray-900">
            Simple Steps to Invest
          </h2>
        </motion.div>

        {/* Steps Container */}
        <div className="flex w-full h-[300px] rounded-3xl overflow-hidden border border-sky-200 shadow-lg">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isExpanded = expandedStep === index;

            return (
              <motion.div
                key={step.id}
                onMouseEnter={() => setExpandedStep(index)}
                onMouseLeave={() => setExpandedStep(0)}
                animate={{ flex: isExpanded ? 4 : 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm border-r border-sky-200/50 last:border-r-0 cursor-pointer overflow-hidden group"
              >
                {/* Background Image for Expanded State */}
                {isExpanded && imagesLoaded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-0"
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </motion.div>
                )}

                {/* Background Overlay for Expanded State */}
                {isExpanded && imagesLoaded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="absolute inset-0 bg-black/40 z-5"
                  />
                )}
                {/* Default State - Number and Title */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isExpanded ? 0 : 1,
                    scale: isExpanded ? 0.8 : 1,
                    y: isExpanded ? -20 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  {/* Step Number */}
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 text-white font-bold text-xl shadow-lg mb-4 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    {step.id}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-800 font-space-grotesk uppercase tracking-wide leading-tight">
                    {step.title}
                  </h3>
                </motion.div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="px-6 pt-14 pb-6 text-center absolute inset-0 flex flex-col justify-center z-20"
                  >
                    {/* Number and Title at Top */}
                    <div className="flex flex-col items-center justify-center mb-6 relative z-10">
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 text-white font-bold text-xl shadow-lg mb-4">
                        {step.id}
                      </div>
                      <h3 className="text-xl font-bold text-white font-space-grotesk uppercase drop-shadow-lg">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <div className="flex-1 flex items-center justify-center relative z-10">
                      <p className="text-white text-sm leading-relaxed font-poppins max-w-xs drop-shadow-md backdrop-blur-sm bg-black/20 p-4 rounded-xl">
                        {step.description}
                      </p>
                    </div>

                    {/* Bottom accent line */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4 relative z-10"></div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
