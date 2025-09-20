'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessActions } from '@/hooks/useContractData';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface ReceiptUploadProps {
  businessId: number;
  businessName: string;
  isOwner: boolean;
}

interface DistributionPreview {
  platformFee: string;
  ownerCut: string;
  tokenHolderAmount: string;
}

const ReceiptUploadModal: React.FC<ReceiptUploadProps> = ({ 
  businessId, 
  businessName, 
  isOwner 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [receiptHash, setReceiptHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [distributionPreview, setDistributionPreview] = useState<DistributionPreview | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { uploadReceiptAndDistributeYield, calculateDistribution } = useBusinessActions();
  const { address } = useAccount();

  // Calculate distribution preview when amount changes
  useEffect(() => {
    const calculatePreview = async () => {
      if (amount && parseFloat(amount) > 0) {
        setIsCalculating(true);
        try {
          // Only calculate if wallet is connected
          if (address) {
            const distribution = await calculateDistribution(amount);
            setDistributionPreview(distribution);
          } else {
            // Show manual calculation if wallet not connected
            const amountNum = parseFloat(amount);
            setDistributionPreview({
              platformFee: (amountNum * 0.05).toFixed(2),
              ownerCut: (amountNum * 0.55).toFixed(2),
              tokenHolderAmount: (amountNum * 0.40).toFixed(2)
            });
          }
        } catch (error) {
          console.error('Error calculating distribution:', error);
          // Fallback to manual calculation
          const amountNum = parseFloat(amount);
          setDistributionPreview({
            platformFee: (amountNum * 0.05).toFixed(2),
            ownerCut: (amountNum * 0.55).toFixed(2),
            tokenHolderAmount: (amountNum * 0.40).toFixed(2)
          });
        } finally {
          setIsCalculating(false);
        }
      } else {
        setDistributionPreview(null);
      }
    };

    const timeoutId = setTimeout(calculatePreview, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [amount, calculateDistribution, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !receiptHash) {
      setUploadStatus('Please fill in both fields');
      return;
    }

    if (!address) {
      setUploadStatus('Please connect your wallet first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing transaction...');

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
        setIsOpen(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      setUploadStatus(`Error: ${error.message || 'Failed to upload receipt'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload Receipt
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Receipt</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Wallet Connection Status */}
              <div className={`mb-4 p-3 rounded-lg border ${
                address 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    address ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="font-medium text-sm">
                    {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Not Connected'}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Business:</strong> {businessName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Distribution:</strong> 55% Owner, 5% Platform, 40% Token Holders
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USDC Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount in USDC"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This amount will be deducted from your wallet
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Hash *
                  </label>
                  <input
                    type="text"
                    value={receiptHash}
                    onChange={(e) => setReceiptHash(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IPFS hash (Qm...) or URL"
                    required
                  />
                </div>

                {/* Distribution Preview */}
                {distributionPreview && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Distribution Preview:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Platform (5%):</span>
                        <span className="font-medium">{distributionPreview.platformFee} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Owner (55%):</span>
                        <span className="font-medium text-green-600">{distributionPreview.ownerCut} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token Holders (40%):</span>
                        <span className="font-medium text-blue-600">{distributionPreview.tokenHolderAmount} USDC</span>
                      </div>
                    </div>
                  </div>
                )}

                {isCalculating && (
                  <div className="text-center text-sm text-gray-500">
                    Calculating distribution...
                  </div>
                )}

                {uploadStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    uploadStatus.includes('Success') 
                      ? 'bg-green-100 text-green-800' 
                      : uploadStatus.includes('Error')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {uploadStatus}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  {!address ? (
                    <div className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg text-center">
                      Connect Wallet
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isUploading || !amount || !receiptHash}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? 'Processing...' : 'Upload & Distribute'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptUploadModal;
