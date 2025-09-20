'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessActions } from '@/hooks/useContractData';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface ReceiptDashboardProps {
  businessId: number;
  businessName: string;
  isOwner: boolean;
}

interface Receipt {
  businessId: number;
  amount: string;
  receiptHash: string;
  description: string;
  timestamp: number;
  uploadedBy: string;
}

const ReceiptDashboard: React.FC<ReceiptDashboardProps> = ({ 
  businessId, 
  businessName, 
  isOwner 
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { getBusinessReceipts } = useBusinessActions();
  const { address } = useAccount();

  useEffect(() => {
    loadReceipts();
  }, [businessId]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const receiptsData = await getBusinessReceipts(businessId);
      
      // Convert receipts to proper format
      const formattedReceipts = receiptsData.map((receipt: any) => ({
        businessId: Number(receipt.businessId),
        amount: ethers.formatUnits(receipt.amount, 6), // Convert from USDC decimals
        receiptHash: receipt.receiptHash,
        description: receipt.description,
        timestamp: Number(receipt.timestamp),
        uploadedBy: receipt.uploadedBy
      }));
      
      setReceipts(formattedReceipts);
    } catch (err: any) {
      console.error('Error loading receipts:', err);
      setError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const totalAmount = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount), 0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Receipts ({receipts.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Receipt Dashboard</h2>
              <p className="text-gray-600">{businessName}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Total Receipts</h3>
              <p className="text-2xl font-bold text-blue-900">{receipts.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Total Amount</h3>
              <p className="text-2xl font-bold text-green-900">{totalAmount.toFixed(2)} USDC</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800">Avg per Receipt</h3>
              <p className="text-2xl font-bold text-purple-900">
                {receipts.length > 0 ? (totalAmount / receipts.length).toFixed(2) : '0.00'} USDC
              </p>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading receipts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadReceipts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No receipts uploaded yet</p>
                {isOwner && (
                  <p className="text-sm text-gray-500 mt-2">
                    Upload your first receipt to start distributing yield
                  </p>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Receipt</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Uploaded By</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(receipt.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">{receipt.amount} USDC</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {receipt.description}
                      </td>
                      <td className="py-3 px-4">
                        {receipt.receiptHash.startsWith('http') ? (
                          <a
                            href={receipt.receiptHash}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500 font-mono">
                            {receipt.receiptHash.slice(0, 20)}...
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatAddress(receipt.uploadedBy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Distribution Breakdown */}
          {receipts.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Total Distribution Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Platform Fee (5%)</p>
                  <p className="font-medium text-red-600">{(totalAmount * 0.05).toFixed(2)} USDC</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Owner Cut (55%)</p>
                  <p className="font-medium text-green-600">{(totalAmount * 0.55).toFixed(2)} USDC</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Token Holders (40%)</p>
                  <p className="font-medium text-blue-600">{(totalAmount * 0.40).toFixed(2)} USDC</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptDashboard;
