import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractService, Business } from '@/services/contractService';
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

// Hook for wallet connection and transactions
export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setConnected(true);
        
        return { account: accounts[0], provider, signer };
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setConnected(false);
  };

  return {
    account,
    provider,
    signer,
    connected,
    connectWallet,
    disconnectWallet
  };
};

// Hook for business interactions
export const useBusinessActions = () => {
  const { signer, connected } = useWallet();

  const investInBusiness = async (businessId: number, amount: string) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const txHash = await contractService.investInBusiness(businessId, amount, signer);
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
      const txHash = await contractService.claimTokens(businessId, signer);
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
      const txHash = await contractService.depositYield(businessId, amount, signer);
      return txHash;
    } catch (error) {
      console.error('Error depositing yield:', error);
      throw error;
    }
  };

  const claimYield = async (businessId: number) => {
    if (!connected || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const txHash = await contractService.claimYield(businessId, signer);
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
        signer
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
    claimYield,
    submitBusiness
  };
};
