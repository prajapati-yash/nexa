"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contractService } from '@/services/contractService';
import {
  FiUpload,
  FiMapPin,
  FiFileText,
  FiTrendingUp,
  FiShield,
  FiCheck,
  FiX,
  FiLoader
} from 'react-icons/fi';

interface BusinessRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (businessId: number) => void;
}

const BusinessRegistrationForm: React.FC<BusinessRegistrationFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { authenticated, login } = usePrivy();
  const { wallets, ready } = useWallets();
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    name: '',
    fundingGoal: '',
    equipmentList: '',
    image: '',
    description: '',
    whyThisWorks: '',
    location: '',
    region: '',
    boringIndexNumber: 5,
    certificate: '',
    yieldRange: '',
    ownerContract: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.fundingGoal || parseFloat(formData.fundingGoal) <= 0) {
      newErrors.fundingGoal = 'Funding goal must be greater than 0';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (formData.boringIndexNumber < 1 || formData.boringIndexNumber > 10) {
      newErrors.boringIndexNumber = 'Boring index must be between 1 and 10';
    }
    if (!formData.yieldRange.trim()) newErrors.yieldRange = 'Yield range is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus('Please fix the errors above');
      return;
    }

    if (!authenticated || !ready || wallets.length === 0) {
      await login();
      setSubmitStatus('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      setSubmitStatus('Submitting business registration...');

      const txHash = await contractService.submitBusiness(
        formData.name,
        formData.fundingGoal,
        formData.equipmentList,
        formData.image,
        formData.description,
        formData.whyThisWorks,
        formData.location,
        formData.region,
        formData.boringIndexNumber,
        formData.certificate,
        formData.yieldRange,
        formData.ownerContract,
        signer
      );

      setSubmitStatus(`✅ Business registered successfully! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Reset form
      setFormData({
        name: '',
        fundingGoal: '',
        equipmentList: '',
        image: '',
        description: '',
        whyThisWorks: '',
        location: '',
        region: '',
        boringIndexNumber: 5,
        certificate: '',
        yieldRange: '',
        ownerContract: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        // You might want to get the business ID from the transaction or contract
        onSuccess(0); // Placeholder - you'd need to get actual business ID
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 3000);

    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-space-grotesk">
                Register New Business
              </h2>
              <p className="text-gray-600 mt-2">
                Submit your business for investment opportunities
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FiFileText className="w-6 h-6 text-[#28aeec]" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                  } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors`}
                  placeholder="Enter business name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal (USDC) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.fundingGoal ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                  } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors`}
                  placeholder="e.g., 10000"
                />
                {errors.fundingGoal && <p className="text-red-600 text-sm mt-1">{errors.fundingGoal}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors resize-none`}
                placeholder="Describe your business, its mission, and what makes it unique..."
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment List
              </label>
              <textarea
                value={formData.equipmentList}
                onChange={(e) => handleInputChange('equipmentList', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#28aeec] focus:ring-2 focus:ring-[#28aeec]/20 transition-colors resize-none"
                placeholder="List the equipment and assets your business needs..."
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FiMapPin className="w-6 h-6 text-[#28aeec]" />
              Location Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                  } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors`}
                  placeholder="e.g., 123 Main Street, Downtown"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.region ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                  } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors`}
                  placeholder="e.g., Metropolitan Area, Suburban"
                />
                {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region}</p>}
              </div>
            </div>
          </div>

          {/* Business Analysis */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FiTrendingUp className="w-6 h-6 text-[#28aeec]" />
              Business Analysis
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why This Works *
              </label>
              <textarea
                value={formData.whyThisWorks}
                onChange={(e) => handleInputChange('whyThisWorks', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#28aeec] focus:ring-2 focus:ring-[#28aeec]/20 transition-colors resize-none"
                placeholder="Explain why your business model works. Use bullet points or paragraphs..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boring Index (1-10) *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.boringIndexNumber}
                    onChange={(e) => handleInputChange('boringIndexNumber', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-[#28aeec]">
                      {formData.boringIndexNumber}
                    </span>
                    <div className="text-xs text-gray-500">Lower = More Stable</div>
                  </div>
                </div>
                {errors.boringIndexNumber && <p className="text-red-600 text-sm mt-1">{errors.boringIndexNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Yield Range *
                </label>
                <input
                  type="text"
                  value={formData.yieldRange}
                  onChange={(e) => handleInputChange('yieldRange', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.yieldRange ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#28aeec]'
                  } focus:ring-2 focus:ring-[#28aeec]/20 transition-colors`}
                  placeholder="e.g., 8-12%"
                />
                {errors.yieldRange && <p className="text-red-600 text-sm mt-1">{errors.yieldRange}</p>}
              </div>
            </div>
          </div>

          {/* Media & Documentation */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FiUpload className="w-6 h-6 text-[#28aeec]" />
              Media & Documentation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#28aeec] focus:ring-2 focus:ring-[#28aeec]/20 transition-colors"
                  placeholder="https://ipfs.io/ipfs/... or image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate URL
                </label>
                <input
                  type="url"
                  value={formData.certificate}
                  onChange={(e) => handleInputChange('certificate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#28aeec] focus:ring-2 focus:ring-[#28aeec]/20 transition-colors"
                  placeholder="https://ipfs.io/ipfs/... or certificate URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Contract Address
              </label>
              <input
                type="text"
                value={formData.ownerContract}
                onChange={(e) => handleInputChange('ownerContract', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#28aeec] focus:ring-2 focus:ring-[#28aeec]/20 transition-colors"
                placeholder="0x1234567890123456789012345678901234567890"
              />
              <p className="text-sm text-gray-500 mt-1">
                Contract address or reference related to the business owner
              </p>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiShield className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Wallet Status</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                ready && wallets.length > 0 && isConnected
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {ready && wallets.length > 0 && isConnected 
                  ? 'Connected' 
                  : 'Not Connected'}
              </div>
            </div>
            {address && (
              <p className="text-sm text-gray-600 mt-2">
                Address: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>

          {/* Submit Status */}
          {submitStatus && (
            <div className={`p-4 rounded-xl text-center font-medium ${
              submitStatus.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : submitStatus.includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {submitStatus}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !authenticated}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isSubmitting || !authenticated
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 text-white hover:shadow-lg hover:shadow-[#28aeec]/25'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Registering...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FiCheck className="w-4 h-4" />
                  Register Business
                </div>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BusinessRegistrationForm;
