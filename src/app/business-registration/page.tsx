"use client";
import React, { useState } from 'react';
import BusinessRegistrationForm from '@/Components/Forms/BusinessRegistrationForm';
import { motion } from 'framer-motion';
import { FiPlus, FiTrendingUp, FiShield, FiHome } from 'react-icons/fi';

const BusinessRegistrationPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleRegistrationSuccess = (businessId: number) => {
    console.log('Business registered successfully with ID:', businessId);
    // You can add additional success handling here
    // For example, redirect to the business page or show a success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <FiHome className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Registration</h3>
            <p className="text-gray-600">
              Simple form to register your business with all necessary details for investors to evaluate.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Investment Ready</h3>
            <p className="text-gray-600">
              Once registered, your business becomes available for investors to fund through our platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <FiShield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Transparent</h3>
            <p className="text-gray-600">
              All transactions are secured by blockchain technology with full transparency and traceability.
            </p>
          </motion.div>
        </div>

        {/* Registration Process */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#28aeec] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fill Form</h3>
              <p className="text-sm text-gray-600">Complete the business registration form with all required details.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#28aeec] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-sm text-gray-600">Connect your wallet to sign the registration transaction.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#28aeec] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit</h3>
              <p className="text-sm text-gray-600">Submit your business to the blockchain registry.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#28aeec] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Funded</h3>
              <p className="text-sm text-gray-600">Investors can now discover and fund your business.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that have successfully raised funds through our platform. 
            Register your business today and start attracting investors.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#28aeec]/25 flex items-center gap-3 mx-auto"
          >
            <FiPlus className="w-6 h-6" />
            Register Your Business Now
          </button>
        </div>
      </div>

      {/* Registration Form Modal */}
      <BusinessRegistrationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default BusinessRegistrationPage;
