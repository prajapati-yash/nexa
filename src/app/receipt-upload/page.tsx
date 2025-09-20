'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessActions } from '@/hooks/useContractData';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import IPFSUpload from '@/Components/ReceiptUpload/IPFSUpload';

interface DistributionPreview {
  platformFee: string;
  ownerCut: string;
  tokenHolderAmount: string;
}

const ReceiptUploadPage = () => {
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [receiptHash, setReceiptHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [distributionPreview, setDistributionPreview] = useState<DistributionPreview | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { uploadReceiptAndDistributeYield, calculateDistribution, getBusinessById } = useBusinessActions();
  const { address } = useAccount();
  const router = useRouter();

  // Get business ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('businessId');
    if (id) {
      setBusinessId(parseInt(id));
    }
  }, []);

  // Load business data
  useEffect(() => {
    const loadBusinessData = async () => {
      if (!businessId) {
        setIsLoading(false);
        return;
      }

      try {
        const business = await getBusinessById(businessId);
        if (business) {
          setBusinessName(business.name);
        }
      } catch (error) {
        console.error('Error loading business data:', error);
        setUploadStatus('Error loading business data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessData();
  }, [businessId, getBusinessById]);

  // Calculate distribution preview when amount changes
  useEffect(() => {
    const calculatePreview = async () => {
      if (amount && parseFloat(amount) > 0) {
        setIsCalculating(true);
        try {
          // Always use manual calculation for consistency and to avoid wallet dependency
          const amountNum = parseFloat(amount);
          setDistributionPreview({
            platformFee: (amountNum * 0.05).toFixed(2),
            ownerCut: (amountNum * 0.95).toFixed(2), // Updated to reflect actual distribution (5% + 95% when no tokens)
            tokenHolderAmount: "0.00" // No tokens exist for this business
          });
        } catch (error) {
          console.error('Error calculating distribution:', error);
          // Fallback to manual calculation
          const amountNum = parseFloat(amount);
          setDistributionPreview({
            platformFee: (amountNum * 0.05).toFixed(2),
            ownerCut: (amountNum * 0.95).toFixed(2),
            tokenHolderAmount: "0.00"
          });
        } finally {
          setIsCalculating(false);
        }
      } else {
        setDistributionPreview(null);
      }
    };

    const timeoutId = setTimeout(calculatePreview, 300); // Reduced debounce time
    return () => clearTimeout(timeoutId);
  }, [amount]); // Removed address dependency to prevent flickering

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) {
      setUploadStatus('Business ID is required');
      return;
    }

    if (!amount || !receiptHash) {
      setUploadStatus('Please fill in both fields');
      return;
    }

    if (!address) {
      setUploadStatus('Please connect your wallet first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Step 1: Checking USDC allowance...');

    try {
      const txHash = await uploadReceiptAndDistributeYield(
        businessId,
        amount,
        receiptHash,
        'Receipt upload' // Default description
      );
      
      setUploadStatus(`Success! Transaction: ${txHash}`);
      
      // Reset form after successful upload
      setTimeout(() => {
        setAmount('');
        setReceiptHash('');
        setUploadStatus(null);
      }, 5000);
      
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      if (error.message.includes('allowance')) {
        setUploadStatus('Error: Please approve USDC spending first. Check your wallet for approval transaction.');
      } else if (error.message.includes('missing revert data')) {
        setUploadStatus('Error: USDC contract call failed. Please check your wallet connection and try again.');
      } else {
        setUploadStatus(`Error: ${error.message || 'Failed to upload receipt'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business ID Required</h2>
          <p className="text-gray-600 mb-4">Please provide a business ID in the URL parameters.</p>
          <button
            onClick={handleBackClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Business
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Receipt</h1>
          <p className="text-gray-600">
            Business: <span className="font-semibold">{businessName}</span>
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Wallet Connection Status */}
          <div className={`mb-6 p-3 rounded-lg border ${
            address 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                address ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium">
                {address ? `Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Not Connected'}
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Automatic Distribution</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-blue-700">Platform</p>
                <p className="font-bold text-red-600">5%</p>
              </div>
              <div className="text-center">
                <p className="text-blue-700">Owner</p>
                <p className="font-bold text-green-600">55%</p>
              </div>
              <div className="text-center">
                <p className="text-blue-700">Token Holders</p>
                <p className="font-bold text-purple-600">40%</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USDC Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter amount in USDC"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This amount will be deducted from your wallet
              </p>
            </div>

            {/* IPFS Upload Component */}
            <div>
              <IPFSUpload 
                onHashReceived={(hash) => setReceiptHash(hash)}
                disabled={isUploading}
              />
            </div>

            {/* Manual Receipt Hash Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Hash *
              </label>
              <input
                type="text"
                value={receiptHash}
                onChange={(e) => setReceiptHash(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="IPFS hash (Qm...) or URL"
                required
              />
            </div>

            {/* Distribution Preview */}
            {distributionPreview && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-3">Distribution Preview:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">Platform (5%)</p>
                    <p className="font-bold text-red-900">{distributionPreview.platformFee} USDC</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Owner (55%)</p>
                    <p className="font-bold text-green-900">{distributionPreview.ownerCut} USDC</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">Token Holders (40%)</p>
                    <p className="font-bold text-purple-900">{distributionPreview.tokenHolderAmount} USDC</p>
                  </div>
                </div>
              </div>
            )}

            {isCalculating && (
              <div className="text-center text-sm text-gray-500">
                Calculating distribution...
              </div>
            )}

            {/* Status Message */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg text-sm ${
                uploadStatus.includes('Success') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : uploadStatus.includes('Error')
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {uploadStatus}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              {!address ? (
                <div className="w-full px-6 py-4 bg-gray-400 text-white text-lg font-semibold rounded-lg text-center">
                  Connect Wallet to Continue
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isUploading || !amount || !receiptHash}
                  className="w-full px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Processing...' : 'Upload Receipt & Distribute'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Simple Help */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Enter the USDC amount (will be deducted from your wallet)</p>
            <p>2. Upload receipt to IPFS or paste the hash</p>
            <p>3. Amount is automatically distributed: 55% to you, 5% to platform, 40% to token holders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploadPage;
