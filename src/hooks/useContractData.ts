import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractService, Business } from '@/services/contractService';
import { useAccount, useWalletClient } from 'wagmi';
import { Asset } from '@/Utils/AssetsData';

// Custom hook for managing contract data
export const useContractData = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch businesses from smart contracts
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contractBusinesses = await contractService.getAllBusinesses();
      setBusinesses(contractBusinesses);
      
      // Convert businesses to assets format for UI
      const formattedAssets = contractBusinesses.map(business => ({
        id: `business-${business.id}`,
        image: "/api/placeholder/400/300", // Placeholder image
        mainImage: "/api/placeholder/800/600",
        title: business.name,
        description: business.equipmentList || "Real-world asset investment opportunity powered by blockchain",
        annualYield: business.annualYield || 0,
        boringIndex: 5, // Default boring index
        location: "Decentralized Platform",
        usdcValue: Number(business.fundingGoal) * 3000, // Rough ETH to USD conversion
        nextPayout: { days: 30, hours: 0, minutes: 0, seconds: 0 },
        powerSaved: { amount: 0, unit: "N/A" },
        whyThisWorks: [
          "Decentralized investment platform",
          "Transparent smart contract execution", 
          "Proportional token distribution",
          "Automated yield distribution",
          "Real-world asset backing"
        ],
        locationOnMap: {
          lat: 0,
          lng: 0,
          address: "Blockchain Network"
        },
        smartContractAddress: business.tokenAddress || "",
        funded: business.funded, // Add funded status
        proof: {
          fileName: `${business.name}_Contract.pdf`,
          url: business.tokenAddress ? `https://sepolia.arbiscan.io/address/${business.tokenAddress}` : ""
        },
        category: "RWA Investment",
        fundingProgress: business.fundingProgress,
        minimumInvestment: business.minimumInvestment,
        totalRequired: Number(business.fundingGoal),
        investorsCount: business.investorsCount || 0,
        status: business.status
      }));
      
      setAssets(formattedAssets);
    } catch (err) {
      console.error('Error fetching contract data:', err);
      setError('Failed to load businesses from blockchain');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchBusinesses();
  };

  // Get businesses by status
  const getBusinessesByStatus = (status: Business['status']) => {
    return businesses.filter(business => business.status === status);
  };

  // Get active businesses
  const getActiveBusinesses = () => {
    return getBusinessesByStatus('active');
  };

  // Get funded businesses
  const getFundedBusinesses = () => {
    return getBusinessesByStatus('funded');
  };

  // Get upcoming businesses
  const getUpcomingBusinesses = () => {
    return getBusinessesByStatus('upcoming');
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    assets,
    loading,
    error,
    refreshData,
    getBusinessesByStatus,
    getActiveBusinesses,
    getFundedBusinesses,
    getUpcomingBusinesses
  };
};

// Hook for wallet connection and transactions (using wagmi)
export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Create ethers signer from walletClient
  const getEthersSigner = async () => {
    if (!walletClient || !isConnected) return null;
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getSigner();
      }
      return null;
    } catch (error) {
      console.error('Error creating ethers signer:', error);
      return null;
    }
  };

  return {
    account: address,
    provider: null, // Not needed with wagmi
    signer: walletClient, // Keep walletClient for compatibility
    getEthersSigner: getEthersSigner, // Function to get ethers signer
    connected: isConnected,
    connectWallet: () => {}, // Handled by Privy
    disconnectWallet: () => {} // Handled by Privy
  };
};

// Hook for business interactions
export const useBusinessActions = () => {
  const { signer, connected, getEthersSigner } = useWallet();

  const investInBusiness = async (businessId: number, amount: string) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.investInBusiness(businessId, amount, ethersSigner);
      return txHash;
    } catch (error) {
      console.error('Error investing in business:', error);
      throw error;
    }
  };

  const claimTokens = async (businessId: number) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.claimTokens(businessId, ethersSigner);
      return txHash;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
  };

  const depositYield = async (businessId: number, amount: string) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.depositYield(businessId, amount, ethersSigner);
      return txHash;
    } catch (error) {
      console.error('Error depositing yield:', error);
      throw error;
    }
  };

  const uploadReceiptAndDistributeYield = async (
    businessId: number, 
    amount: string, 
    receiptHash: string, 
    description: string
  ) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.uploadReceiptAndDistributeYield(
        businessId, 
        amount, 
        receiptHash, 
        description, 
        ethersSigner
      );
      return txHash;
    } catch (error) {
      console.error('Error uploading receipt and distributing yield:', error);
      throw error;
    }
  };

  const getBusinessReceipts = async (businessId: number) => {
    try {
      const receipts = await contractService.getBusinessReceipts(businessId);
      return receipts;
    } catch (error) {
      console.error('Error fetching business receipts:', error);
      throw error;
    }
  };

  const getBusinessById = async (businessId: number) => {
    try {
      const business = await contractService.getBusinessById(businessId);
      return business;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  };

  const calculateDistribution = async (totalAmount: string) => {
    try {
      const distribution = await contractService.calculateDistribution(totalAmount);
      return distribution;
    } catch (error) {
      console.error('Error calculating distribution:', error);
      throw error;
    }
  };

  const claimYield = async (businessId: number) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.claimYield(businessId, ethersSigner);
      return txHash;
    } catch (error) {
      console.error('Error claiming yield:', error);
      throw error;
    }
  };

  const submitBusiness = async (
    name: string, 
    fundingGoal: string, 
    equipmentList: string,
    image: string,
    description: string,
    whyThisWorks: string,
    location: string,
    region: string,
    boringIndexNumber: number,
    certificate: string,
    yieldRange: string,
    ownerContract: string
  ) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const ethersSigner = await getEthersSigner();
      if (!ethersSigner) {
        throw new Error('Failed to get ethers signer');
      }
      
      const txHash = await contractService.submitBusiness(
        name, 
        fundingGoal, 
        equipmentList,
        image,
        description,
        whyThisWorks,
        location,
        region,
        boringIndexNumber,
        certificate,
        yieldRange,
        ownerContract,
        ethersSigner
      );
      return txHash;
    } catch (error) {
      console.error('Error submitting business:', error);
      throw error;
    }
  };

  return {
    investInBusiness,
    claimTokens,
    depositYield,
    uploadReceiptAndDistributeYield,
    getBusinessReceipts,
    getBusinessById,
    calculateDistribution,
    claimYield,
    submitBusiness
  };
};
