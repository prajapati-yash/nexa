"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { IoWallet, IoCopy, IoLogOut, IoChevronDown } from "react-icons/io5";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnectWallet = () => {
    if (!authenticated || !isConnected) {
      login();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    setDropdownOpen(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/20 backdrop-blur-md" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-white font-bold text-xl font-space-grotesk">
                Nexa
              </span>
            </Link>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-3 font-poppins">
            {/* How It Works Button */}
            <button
              onClick={scrollToHowItWorks}
              className="cursor-pointer group relative overflow-hidden text-white/90 hover:text-white font-medium px-5 py-2.5 rounded-full transition-all duration-500 hover:bg-gradient-to-r hover:from-white/20 hover:to-sky-400/20 backdrop-blur-sm border border-white/30  hover:shadow-lg hover:shadow-[#28aeec]/20 uppercase"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <HiQuestionMarkCircle className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 " />
                <span className="hidden sm:block">How It Works</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/15 to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></div>
            </button>

            {/* Connect Wallet Button / Dropdown */}
            {ready && authenticated && isConnected ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="cursor-pointer group relative overflow-hidden
        bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec]
        text-white font-semibold
        px-6 py-2.5 rounded-full transition-all duration-500
        transform hover:scale-105 hover:-translate-y-0.5
        shadow-lg hover:shadow-xl hover:shadow-[#28aeec]/40
        border border-[#28aeec]/40 hover:border-[#28aeec]/80 uppercase"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <IoWallet className="w-5 h-5 text-white " />
                    <span className="hidden sm:block">
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : "Connected"}
                    </span>
                    <IoChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>

                  {/* Shine sweep */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-white/30 via-[#28aeec]/20 to-white/30
        opacity-0 group-hover:opacity-100 transition-all duration-700
        transform -translate-x-full group-hover:translate-x-0"
                  ></div>

                  {/* Glow border */}
                  <div
                    className="absolute -inset-0.5 bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec]
        rounded-full opacity-0 group-hover:opacity-40 blur-lg transition-all duration-500"
                  ></div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64
        bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl
        border border-[#28aeec]/40 overflow-hidden z-50
        shadow-[#28aeec]/20"
                  >
                    <div className="p-4">
                      {/* Address Section */}
                      <div className="mb-4">
                        <p className="text-[#28aeec] text-sm font-medium mb-2 font-poppins">
                          Wallet Address
                        </p>
                        <div
                          className="flex items-center justify-between
              bg-[#28aeec]/10 backdrop-blur-md rounded-lg p-3
              border border-[#28aeec]/30
              hover:bg-[#28aeec]/20 hover:border-[#28aeec]/50 transition-all duration-300"
                        >
                          <span className="text-[#28aeec] font-mono text-sm font-medium">
                            {address
                              ? `${address.slice(0, 8)}...${address.slice(-8)}`
                              : ""}
                          </span>
                          <button
                            onClick={copyAddress}
                            className="cursor-pointer p-2 hover:bg-[#28aeec]/30 rounded-lg transition-all duration-300 group"
                            title="Copy Address"
                          >
                            <IoCopy className="w-4 h-4 text-[#28aeec] group-hover:text-[#28aeec] group-hover:scale-110" />
                          </button>
                        </div>
                      </div>

                      {/* Disconnect Button */}
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white
               bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec]
              rounded-lg transition-all duration-300 group
              border border-[#28aeec]/40 hover:border-[#28aeec]/80 hover:shadow-lg hover:shadow-[#28aeec]/30 cursor-pointer font-poppins"
                      >
                        <IoLogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="font-medium">Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="cursor-pointer group relative overflow-hidden
      bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec]
      text-white font-semibold
      px-6 py-2.5 rounded-full transition-all duration-500
      transform hover:scale-105 hover:-translate-y-0.5
      shadow-lg hover:shadow-xl hover:shadow-[#28aeec]/40
      border border-[#28aeec]/40 hover:border-[#28aeec]/80 uppercase"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <IoWallet className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="hidden sm:block">Connect Wallet</span>
                </span>

                {/* Shine sweep */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-white/30 via-[#28aeec]/20 to-white/30
      opacity-0 group-hover:opacity-100 transition-all duration-700
      transform -translate-x-full group-hover:translate-x-0"
                ></div>

                {/* Glow border */}
                <div
                  className="absolute -inset-0.5 bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec]
      rounded-full opacity-0 group-hover:opacity-40 blur-lg transition-all duration-500"
                ></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
