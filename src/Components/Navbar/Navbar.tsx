"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { HiQuestionMarkCircle } from 'react-icons/hi2'
import { IoWallet } from 'react-icons/io5'
import { MdCheck } from 'react-icons/md'

const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleConnectWallet = () => {
    // Wallet connection logic here
    setIsWalletConnected(!isWalletConnected)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/20 backdrop-blur-md' : ''
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-white font-bold text-xl font-space-grotesk">Nexa</span>
            </Link>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-3 font-poppins">
            {/* How It Works Button */}
            <button className="cursor-pointer group relative overflow-hidden text-white/90 hover:text-white font-medium px-5 py-2.5 rounded-full transition-all duration-500 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-white/10 uppercase">
              <span className="relative z-10 flex items-center gap-2.5">
                <HiQuestionMarkCircle className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span className="hidden sm:block">How It Works</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-[#28aeec]/10 to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></div>
            </button>

            {/* Connect Wallet Button */}
            <button
              onClick={handleConnectWallet}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-[#28aeec] via-sky-400 to-[#28aeec] hover:from-sky-500 hover:via-[#28aeec] hover:to-sky-500 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-500 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl hover:shadow-[#28aeec]/40 border border-sky-300/30 uppercase"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                {isWalletConnected ? (
                  <>
                    <MdCheck className="w-5 h-5 text-green-300 animate-pulse" />
                    <span className="hidden sm:block">Connected</span>
                  </>
                ) : (
                  <>
                    <IoWallet className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="hidden sm:block">Connect Wallet</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
