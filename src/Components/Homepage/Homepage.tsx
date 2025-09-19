"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../Navbar/Navbar'


const Homepage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const images = [
    '/assets/car.jpg',
    '/assets/laundromat.jpg',
    '/assets/EvCharge.jpg'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [images.length])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
  }

  const goToPrevious = () => {
    setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)
  }

  const goToNext = () => {
    setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <Image
                src={image}
                alt={`Business ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[8000ms] ease-out hover:scale-110"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-[#2d4b59]/60 "></div>
            </div>
          ))}
        </div>

        {/* Animated Background Elements */}
        {/* <div className="absolute inset-0 z-5 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-sky-200/40 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-sky-300/30 rounded-full animate-bounce animation-delay-3000"></div>
        </div> */}

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition-all duration-500 hover:scale-110 hover:rotate-12 animate-bounce-subtle backdrop-blur-sm border border-white/30"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition-all duration-500 hover:scale-110 hover:-rotate-12 animate-bounce-subtle backdrop-blur-sm border border-white/30"
        >
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`cursor-pointer size-3 rounded-full transition-all duration-500 transform hover:scale-125 ${
                index === currentImageIndex
                  ? 'bg-white shadow-lg shadow-white/50 animate-pulse'
                  : 'bg-white/40 hover:bg-white/70 hover:rotate-45'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className=" mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight font-space-grotesk drop-shadow-lg bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent uppercase">
              Invest in Next Generation Assets:<br/> Everyday Businesses, Extraordinary Returns
            </h1>
            {/* bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent */}

            <p className="text-lg sm:text-xl lg:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed font-poppins drop-shadow-md">
              Own a piece of stable businesses with affordable entry points. Earn 15-25% yields, backed by equipment, powered by Arbitrum.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/marketplace">
                <button className="group bg-gradient-to-r from-white/20 to-sky-100/20 hover:bg-white/20 text-white font-medium px-10 py-5 rounded-full cursor-pointer font-poppins text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-sky-200/50 border-2 border-white/20 backdrop-blur-sm relative z-10 overflow-hidden uppercase">
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Investments
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-sky-200/20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
