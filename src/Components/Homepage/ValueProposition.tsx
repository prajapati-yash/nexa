"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";
import { RiCoinLine } from "react-icons/ri";
import { FaGem } from "react-icons/fa";

const ValueProposition = () => {
  const valueProps = [
    {
      icon: RiCoinLine,
      title: "Stable Yield",
      description:
        "Harness predictable returns from real-world businesses, escaping crypto market volatility.",
      iconColor: "text-[#28aeec]",
      delay: 0.2,
    },
    {
      icon: FaGem,
      title: "Transparent Automation",
      description: "Secure and transparent revenue distribution through smart contracts and on-chain oracles.",
      iconColor: "text-[#28aeec]",
      delay: 0.4,
    },
    {
      icon: HiSparkles,
      title: "Real-World Assets",
      description: "Gain access to a new asset class of tokenized, real-world business revenue streams.",
      iconColor: "text-[#28aeec]",
      delay: 0.6,
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Sky blue gradient overlays */}
      <div className="absolute top-[2%] left-[5%] w-[200px] h-[200px] bg-sky-400/40 blur-3xl opacity-100 rounded-full z-0" />
      <div className="absolute bottom-[10%] right-[4%] w-[200px] h-[200px] bg-sky-500/60 blur-3xl opacity-100 rounded-full z-0" />
      <div className="absolute bottom-[35%] right-[8%] w-[150px] h-[150px] bg-sky-200/50 blur-3xl opacity-100 rounded-full z-0" />
      <div className="absolute bottom-[20%] left-[18%] w-[120px] h-[120px] bg-sky-300/50 blur-3xl opacity-100 rounded-full z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <FaGem/>
            </div>
            <span className="uppercase text-3xl tracking-wider text-[#28aeec] font-semibold font-space-grotesk">
              Value Proposition
            </span>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-sky-400/50 via-sky-200/50 to-transparent mb-6"></div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold uppercase font-space-grotesk leading-tight text-gray-900">
            Invest Smart. <br />
            Earn Securely.
          </h2>
        </motion.div>

        {/* Value Proposition Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {valueProps.map((prop, index) => {
            const IconComponent = prop.icon;
            return (
              <motion.div
                key={prop.title}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  rotateY: 5,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 h-full hover:border-sky-400/50 hover:shadow-2xl hover:shadow-sky-200/20 transition-all duration-500 shadow-lg hover:bg-white/30">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-sky-100/60 backdrop-blur-sm hover:bg-sky-400/20 p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <IconComponent
                        className={`w-full h-full ${prop.iconColor} transition-all duration-300 group-hover:drop-shadow-lg`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-space-grotesk group-hover:text-[#28aeec] transition-colors duration-300 uppercase">
                    {prop.title}
                  </h3>

                  <p className="text-gray-700 leading-relaxed text-lg font-poppins group-hover:text-gray-800">
                    {prop.description}
                  </p>

                  {/* Glowing accent line */}
                  <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-sky-200"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        
      </div>
    </section>
  );
};

export default ValueProposition;
