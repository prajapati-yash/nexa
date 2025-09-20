"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getAssetById, assetsData, formatNextPayout, Asset } from '@/Utils/AssetsData';
import { useContractData } from '@/hooks/useContractData';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { contractService } from '@/services/contractService';
import { ethers } from 'ethers';
import { useParams, useRouter } from "next/navigation";
import {
  FiZap,
  FiMapPin,
  FiTarget,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiFileText,
  FiMinus,
  FiPlus,
  FiArrowLeft,
} from "react-icons/fi";
import { BsLightning, BsCopy, BsCoin } from "react-icons/bs";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaCoins } from "react-icons/fa6";
import { ReceiptUploadModal, ReceiptDashboard } from '@/Components/ReceiptUpload';

const IndividualAssets = () => {
    const params = useParams();
  const { assets: blockchainAssets, loading: blockchainLoading } = useContractData();
  const { authenticated, login } = usePrivy();
  const { wallets, ready } = useWallets();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [totalValue, setTotalValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investmentStatus, setInvestmentStatus] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [userContribution, setUserContribution] = useState<string>("0");
  const [userTokenBalance, setUserTokenBalance] = useState<string>("0");
  const [canClaimTokens, setCanClaimTokens] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);

  // Extract business ID from asset ID (format: "business-0", "business-1", etc.)
  const businessId = asset?.id.startsWith('business-') 
    ? parseInt(asset.id.replace('business-', '')) 
    : null;

  // Debug logging
  console.log('IndividualAssets render:', {
    paramsTitle: params.title,
    blockchainLoading,
    blockchainAssetsLength: blockchainAssets.length,
    assetsDataLength: assetsData.length,
    asset: asset?.title || 'null',
    businessId
  });

  useEffect(() => {
    console.log('IndividualAssets useEffect triggered:', {
      paramsTitle: params.title,
      blockchainLoading,
      blockchainAssetsLength: blockchainAssets.length,
      assetsDataLength: assetsData.length
    });

    if (params.title) {
      // Convert URL-encoded title back to readable format and find matching asset
      const decodedTitle = decodeURIComponent(params.title as string);
      console.log('Decoded title:', decodedTitle);
      
      // First try to find in static assets data
      let foundAsset = assetsData.find(a => {
        const urlTitle = a.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const matches = urlTitle === decodedTitle.toLowerCase() || a.id === decodedTitle;
        console.log('Checking static asset:', { title: a.title, urlTitle, decodedTitle, matches });
        return matches;
      });
      
      console.log('Found in static assets:', foundAsset);
      
      // If not found in static data, try blockchain data
      if (!foundAsset && !blockchainLoading) {
        foundAsset = blockchainAssets.find(a => {
          const urlTitle = a.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const matches = urlTitle === decodedTitle.toLowerCase() || a.id === decodedTitle;
          console.log('Checking blockchain asset:', { title: a.title, urlTitle, decodedTitle, matches });
          return matches;
        });
        console.log('Found in blockchain assets:', foundAsset);
      }
      
      console.log('Final found asset:', foundAsset);
      setAsset(foundAsset || null);
    } else {
      console.log('No params.title found');
    }
  }, [params.title, blockchainAssets, blockchainLoading]);

  useEffect(() => {
    if (asset) {
      setTotalValue(tokenQuantity * asset.minimumInvestment);
    }
  }, [tokenQuantity, asset]);

  // Check user's contribution and token status when asset loads
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!asset || !address || !asset.id.startsWith('business-')) return;
      
      try {
        if (!businessId) return;
        
        // Check if tokens are minted
        const minted = await contractService.areTokensMinted(businessId);
        setTokensMinted(minted);
        
        // Get user's contribution
        const contribution = await contractService.getUserContribution(businessId, address!);
        setUserContribution(contribution);
        
        // Get user's token balance
        const tokenBalance = await contractService.getUserTokenBalance(businessId, address!);
        setUserTokenBalance(tokenBalance);
        
        // Check if user can claim tokens
        const canClaim = await contractService.canClaimTokens(businessId, address!);
        setCanClaimTokens(canClaim);
        
        // Check if user is business owner
        const business = await contractService.getBusinessById(businessId);
        const isOwner = business?.owner.toLowerCase() === address!.toLowerCase();
        setIsBusinessOwner(isOwner || false);
        
        console.log('User status:', {
          businessId,
          contribution,
          tokenBalance,
          canClaim,
          minted,
          isOwner
        });
        
        // Debug claim button visibility
        console.log('Claim button conditions:', {
          'asset?.funded': asset?.funded,
          'tokensMinted': minted,
          'canClaimTokens': canClaim,
          'shouldShowClaimButton': asset?.funded && minted && canClaim
        });
        
        // Additional debug info
        console.log('Detailed debug info:', {
          businessId,
          userAddress: address,
          contribution: contribution,
          tokenBalance: tokenBalance,
          contributionNumber: parseFloat(contribution),
          tokenBalanceNumber: parseFloat(tokenBalance),
          hasContribution: parseFloat(contribution) > 0,
          hasTokens: parseFloat(tokenBalance) > 0,
          shouldShowButton: asset?.funded && minted && (parseFloat(contribution) > 0 && parseFloat(tokenBalance) === 0)
        });
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();
  }, [asset, address]);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, tokenQuantity + change);
    setTokenQuantity(newQuantity);
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimTokens = async () => {
    if (!asset || !address) return;

    try {
      setIsClaiming(true);
      setClaimStatus(null);

      // Check if wallets are ready and connected
      if (!ready || wallets.length === 0) {
        await login();
        setClaimStatus('Wallet connected! Please try claiming again.');
        return;
      }

      // Get the first connected wallet
      const wallet = wallets[0];
      
      if (!wallet) {
        throw new Error('No wallet available');
      }

      if (!businessId) {
        throw new Error('Invalid business ID');
      }

      // Get the provider and signer from Privy wallet
      const provider = await wallet.getEthereumProvider();
      let ethersProvider = new ethers.BrowserProvider(provider);
      let signer = await ethersProvider.getSigner();

      setClaimStatus('Processing token claim...');

      // Call the smart contract to claim tokens
      const txHash = await contractService.claimTokens(businessId, signer);
      
      setClaimStatus(`Tokens claimed successfully! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Refresh user status
      setTimeout(async () => {
        try {
          const contribution = await contractService.getUserContribution(businessId, address!);
          const tokenBalance = await contractService.getUserTokenBalance(businessId, address!);
          const canClaim = await contractService.canClaimTokens(businessId, address!);
          
          setUserContribution(contribution);
          setUserTokenBalance(tokenBalance);
          setCanClaimTokens(canClaim);
        } catch (error) {
          console.error('Error refreshing user status:', error);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Token claim error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('No tokens available')) {
        errorMessage = 'No tokens available for claiming. You may not have contributed to this business or tokens may not be minted yet.';
      } else if (error.message.includes('Cannot claim tokens')) {
        errorMessage = 'Cannot claim tokens. Please ensure tokens are minted and you have contributed to this business.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      }
      
      setClaimStatus(`Error: ${errorMessage}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleInvestClick = async () => {
    if (!asset) return;

    try {
      setIsInvesting(true);
      setInvestmentStatus(null);

      // Check if wallets are ready and connected
      if (!ready || wallets.length === 0) {
        await login();
        setInvestmentStatus('Wallet connected! Please try investing again.');
        return;
      }

      // Get the first connected wallet
      const wallet = wallets[0];
      
      // Ensure wallet is ready for transactions
      if (!wallet) {
        throw new Error('No wallet available');
      }

      if (!businessId) {
        throw new Error('Invalid business ID');
      }
      
      // Additional validation: check if business exists
      try {
        const businessExists = await contractService.getBusinessById(businessId);
        if (!businessExists) {
          throw new Error('Business does not exist');
        }
        console.log('Business exists:', businessExists.name);
      } catch (error) {
        console.error('Error checking business existence:', error);
        throw new Error('Could not verify business exists');
      }

      // Check if this is a blockchain asset and get business details
      if (asset.id.startsWith('business-')) {
        try {
          const businessDetails = await contractService.getBusinessById(businessId);
          
          if (businessDetails) {
            console.log('Business details:', businessDetails);
            
            // Check if business is already funded
            if (businessDetails.funded) {
              setInvestmentStatus('This business is already fully funded and no longer accepting investments.');
              return;
            }
            
            // Check if investment would exceed funding goal
            const remainingGoal = Number(businessDetails.fundingGoal) - Number(businessDetails.totalRaised);
            const investmentAmount = totalValue; // Total value is already in USDC
            
            console.log('Investment check:', {
              investmentAmount,
              remainingGoal,
              fundingGoal: businessDetails.fundingGoal,
              totalRaised: businessDetails.totalRaised,
              funded: businessDetails.funded
            });
            
            if (investmentAmount > remainingGoal) {
              setInvestmentStatus(`Investment amount (${investmentAmount.toFixed(2)} USDC) exceeds remaining goal (${remainingGoal.toFixed(2)} USDC).`);
              return;
            }
            
            // Check if investment amount is reasonable (not too small)
            if (investmentAmount < 1) {
              setInvestmentStatus('Investment amount is too small. Minimum investment is 1 USDC.');
              return;
            }
          } else {
            setInvestmentStatus('Could not fetch business details. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error checking business details:', error);
          setInvestmentStatus('Error fetching business details. Please try again.');
          return;
        }
      }

      // Convert token quantity to USDC (1 token = 1 USDC)
      const usdcAmount = totalValue.toString();

      setInvestmentStatus('Processing investment...');
      
      // Get the provider and signer from Privy wallet
      const provider = await wallet.getEthereumProvider();
      let ethersProvider = new ethers.BrowserProvider(provider);
      let signer = await ethersProvider.getSigner();
      
      // Debug logging
      console.log('Wallet debug info:', {
        wallet: wallet.address,
        provider: provider,
        ethersProvider: ethersProvider,
        signer: signer.address,
        businessId,
        usdcAmount
      });
      
      // Check USDC balance using the same provider as contract service
      const contractServiceProvider = new ethers.JsonRpcProvider("https://arb-sepolia.g.alchemy.com/v2/8eRw5isnshGewNcmFkaOmKIp49nPHQal");
      const usdcContract = new ethers.Contract("0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)"
      ], contractServiceProvider);
      const usdcBalance = await usdcContract.balanceOf(signer.address);
      console.log('Wallet USDC balance (Arbitrum Sepolia):', ethers.formatUnits(usdcBalance, 6), 'USDC');
      
      // Check if wallet is connected to the correct network
      let network = await ethersProvider.getNetwork();
      console.log('Connected network:', network);
      
      if (network.chainId !== BigInt(421614)) {
        // Try to switch to Arbitrum Sepolia automatically
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x66eee' }], // 421614 in hex
          });
          console.log('Successfully switched to Arbitrum Sepolia');
          
          // Wait a moment for the network change to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh the provider and signer after network change
          const newProvider = await wallet.getEthereumProvider();
          const newEthersProvider = new ethers.BrowserProvider(newProvider);
          const newSigner = await newEthersProvider.getSigner();
          
          // Update the signer for the transaction
          ethersProvider = newEthersProvider;
          signer = newSigner;
          
        } catch (switchError: any) {
          // If the chain doesn't exist, try to add it
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x66eee', // 421614 in hex
                  chainName: 'Arbitrum Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
                  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
                }],
              });
              console.log('Successfully added and switched to Arbitrum Sepolia');
              
              // Wait a moment for the network change to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Refresh the provider and signer after network change
              const newProvider = await wallet.getEthereumProvider();
              const newEthersProvider = new ethers.BrowserProvider(newProvider);
              const newSigner = await newEthersProvider.getSigner();
              
              // Update the signer for the transaction
              ethersProvider = newEthersProvider;
              signer = newSigner;
              
            } catch (addError) {
              console.error('Failed to add Arbitrum Sepolia network:', addError);
            }
          } else {
            console.error('Failed to switch to Arbitrum Sepolia:', switchError);
          }
        }
        
        // Check network again after attempting to switch
        network = await ethersProvider.getNetwork();
        if (network.chainId !== BigInt(421614)) {
          let networkMessage = `Please switch to Arbitrum Sepolia network. Current network: ${network.name} (Chain ID: ${network.chainId})`;
          
          if (network.chainId === BigInt(42161)) {
            networkMessage += '\n\nYou are currently on Arbitrum Mainnet. Please switch to Arbitrum Sepolia testnet.';
          }
          
          networkMessage += '\n\nArbitrum Sepolia Configuration:\n';
          networkMessage += '- Network Name: Arbitrum Sepolia\n';
          networkMessage += '- RPC URL: https://sepolia-rollup.arbitrum.io/rpc\n';
          networkMessage += '- Chain ID: 421614\n';
          networkMessage += '- Currency Symbol: ETH\n';
          networkMessage += '- Block Explorer: https://sepolia.arbiscan.io/';
          
          throw new Error(networkMessage);
        }
      }
      
      if (usdcBalance < ethers.parseUnits(usdcAmount, 6)) {
        throw new Error(`Insufficient USDC in wallet. You have ${ethers.formatUnits(usdcBalance, 6)} USDC but need ${usdcAmount} USDC.`);
      }
      
      // Call the smart contract directly with the refreshed signer
      console.log('Using signer for transaction:', signer.address);
      const txHash = await contractService.investInBusiness(businessId, usdcAmount, signer);
      
      setInvestmentStatus(`Investment successful! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Check if business is now fully funded
      try {
        const updatedBusiness = await contractService.getBusinessById(businessId);
        console.log('Updated business after investment:', updatedBusiness);
        
        if (updatedBusiness?.funded) {
          setInvestmentStatus(`Investment successful! Business is now fully funded. Minting tokens...`);
          
          // Automatically mint tokens for the fully funded business
          try {
            const mintTxHash = await contractService.mintTokensForBusiness(businessId, signer);
            console.log('Tokens minted successfully:', mintTxHash);
            
            setInvestmentStatus(`Investment successful! Business is fully funded and tokens have been minted. You can now claim your tokens!`);
            
            // Refresh user status to show updated contribution and claim button
            setTimeout(async () => {
              try {
                const contribution = await contractService.getUserContribution(businessId, address!);
                const canClaim = await contractService.canClaimTokens(businessId, address!);
                const minted = await contractService.areTokensMinted(businessId);
                
                setUserContribution(contribution);
                setCanClaimTokens(canClaim);
                setTokensMinted(minted);
              } catch (error) {
                console.error('Error refreshing user status:', error);
              }
            }, 2000);
            
          } catch (mintError: any) {
            console.error('Error minting tokens:', mintError);
            
            if (mintError.message.includes('Tokens already minted')) {
              setInvestmentStatus(`Investment successful! Business is fully funded and tokens are already minted. You can claim your tokens!`);
              
              // Refresh user status
              setTimeout(async () => {
                try {
                  const contribution = await contractService.getUserContribution(businessId, address!);
                  const canClaim = await contractService.canClaimTokens(businessId, address!);
                  const minted = await contractService.areTokensMinted(businessId);
                  
                  setUserContribution(contribution);
                  setCanClaimTokens(canClaim);
                  setTokensMinted(minted);
                } catch (error) {
                  console.error('Error refreshing user status:', error);
                }
              }, 2000);
            } else {
              setInvestmentStatus(`Investment successful! Business is fully funded. Token minting failed: ${mintError.message}`);
            }
          }
        } else {
          setInvestmentStatus(`Investment successful! Transaction: ${txHash.slice(0, 10)}... Business needs more funding to reach goal.`);
          
          // Refresh user contribution
          setTimeout(async () => {
            try {
              const contribution = await contractService.getUserContribution(businessId, address!);
              setUserContribution(contribution);
            } catch (error) {
              console.error('Error refreshing user contribution:', error);
            }
          }, 2000);
        }
      } catch (error) {
        console.log('Error checking business status after investment:', error);
        setInvestmentStatus(`Investment successful! Transaction: ${txHash.slice(0, 10)}...`);
      }
      
      // Reset form
      setTokenQuantity(1);
      
    } catch (error: any) {
      console.error('Investment error:', error);
      
      // Handle specific error messages
      let errorMessage = error.message;
      if (error.message.includes('Business already funded')) {
        errorMessage = 'This business is already fully funded and no longer accepting investments.';
      } else if (error.message.includes('Exceeds funding goal')) {
        errorMessage = 'Investment amount exceeds the remaining funding goal.';
      } else if (error.message.includes('Investment must be positive')) {
        errorMessage = 'Investment amount must be greater than zero.';
      } else if (error.message.includes('Invalid ID')) {
        errorMessage = 'Invalid business ID.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet.';
      } else if (error.message.includes('missing revert data')) {
        errorMessage = 'Transaction failed. This business may not exist or may have restrictions.';
      } else if (error.message.includes('CALL_EXCEPTION')) {
        errorMessage = 'Smart contract call failed. Please check the business details and try again.';
      } else if (error.message.includes('network changed')) {
        errorMessage = 'Network changed during transaction. Please try again after the network switch completes.';
      } else if (error.message.includes('NETWORK_ERROR')) {
        errorMessage = 'Network error occurred. Please ensure you are connected to Arbitrum Sepolia and try again.';
      } else if (error.message.includes('execution reverted')) {
        // Extract revert reason if available
        if (error.message.includes('Business already funded')) {
          errorMessage = 'This business is already fully funded and no longer accepting investments.';
        } else if (error.message.includes('Exceeds funding goal')) {
          errorMessage = 'Investment amount exceeds the remaining funding goal.';
        } else {
          errorMessage = 'Transaction reverted. Please check the business details and try again.';
        }
      }
      
      setInvestmentStatus(`Error: ${errorMessage}`);
    } finally {
      setIsInvesting(false);
    }
  };

  // Show loading if blockchain data is still loading
  if (blockchainLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#28aeec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    router.push("/marketplace");
  };

  const backgroundIcons = [
    FiTrendingUp,  
    BsCoin,       
    FaCoins     
  ];

  const getActiveIconAndVisibility = () => {
    const mainContentElement = document.querySelector('.main-content-grid');
    if (!mainContentElement) return { icon: backgroundIcons[0], isVisible: false };

    const rect = mainContentElement.getBoundingClientRect();
    const screenCenter = window.innerHeight / 2;

    // Only show icon when main content grid's top reaches the center of the screen
    const shouldShowIcon = rect.top <= screenCenter && rect.bottom > 0;

    if (!shouldShowIcon) return { icon: backgroundIcons[0], isVisible: false };

    // Calculate scroll progress within the main content area
    const elementHeight = mainContentElement.scrollHeight;
    const visibleTop = Math.max(0, screenCenter - rect.top);
    const scrollPercent = visibleTop / Math.max(elementHeight - window.innerHeight, 1);

    const iconIndex = Math.floor(scrollPercent * backgroundIcons.length);
    const activeIcon = backgroundIcons[Math.min(iconIndex, backgroundIcons.length - 1)] || backgroundIcons[0];

    return { icon: activeIcon, isVisible: true };
  };

  const { icon: ActiveIcon, isVisible: showIcon } = getActiveIconAndVisibility();



  // Show not found if asset is not found in either static or blockchain data
  if (!asset) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Asset Not Found</h2>
          <p className="text-gray-600 font-poppins mb-4">
            The asset you're looking for doesn't exist in our database.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Available assets:</p>
            <p>• Static assets: {assetsData.length}</p>
            <p>• Blockchain assets: {blockchainAssets.length}</p>
          </div>
          <button
            onClick={handleBackClick}
            className="mt-4 bg-[#28aeec] text-white px-6 py-2 rounded-lg hover:bg-[#28aeec]/90 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute top-[15%] right-[8%] w-[300px] h-[300px] bg-[#28aeec]/20 blur-3xl opacity-60 rounded-full z-0" />
      <div className="absolute bottom-[25%] left-[5%] w-[250px] h-[250px] bg-sky-400/30 blur-3xl opacity-80 rounded-full z-0" />
      <div className="absolute top-[45%] left-[12%] w-[180px] h-[180px] bg-sky-300/25 blur-3xl opacity-70 rounded-full z-0" />
      <div className="absolute bottom-[5%] right-[15%] w-[200px] h-[200px] bg-[#28aeec]/15 blur-3xl opacity-50 rounded-full z-0" />

      <div className="relative z-10">
        {/* Hero Section with Main Image and Title/Description Overlay */}
        <div className="relative h-[70vh] min-h-[550px] overflow-hidden">
          <Image
            src={asset?.mainImage || ''}
            alt={asset?.title || 'Asset Image'}
            fill
            className="object-cover"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-20">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-3xl"
                >
                  {/* Status Badge */}
                  <div className="mb-6 flex gap-1">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      onClick={handleBackClick}
                      className="flex cursor-pointer  items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 font-poppins text-white font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/30 hover:border-white/50"
                    >
                      <FiArrowLeft className="w-5 h-5" />
                      <span className="hidden sm:block">Back</span>
                    </motion.button>
                    <span
                      className={`font-poppins uppercase inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                        asset.status === "active"
                          ? "bg-green-500"
                          : asset.status === "upcoming"
                          ? "bg-[#28aeec]"
                          : asset.status === "funded"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      } text-white`}
                    >
                      <BsLightning className="w-4 h-4 mr-2" />
                      {asset.status.charAt(0).toUpperCase() +
                        asset.status.slice(1)}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-space-grotesk mb-6 leading-tight">
                    {asset?.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-white/90 font-poppins leading-relaxed mb-8 max-w-2xl">
                    {asset?.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-white/80 text-lg">
                    <FiMapPin className="w-6 h-6 mr-3 text-[#28aeec]" />
                    <span className="font-semibold">{asset?.location}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 sm:px-6 lg:px-8 -mt-16 relative z-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                  Funding Progress
                </h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#28aeec]">
                    {asset.fundingProgress}%
                  </div>
                  <div className="text-sm text-gray-600">
                    ${asset.totalRequired.toLocaleString()} target
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${asset?.fundingProgress || 0}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>
                    $
                    {(
                      (asset.totalRequired * asset.fundingProgress) /
                      100
                    ).toLocaleString()}{" "}
                    raised
                  </span>
                  <span>{asset.investorsCount} investors</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fixed Background Icon - Only visible when main content grid is in view */}
        {showIcon && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#28aeec]/15 z-0 pointer-events-none">
            <motion.div
              key={ActiveIcon.name}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                type: "spring",
                stiffness: 100
              }}
              className="relative"
            >
              <ActiveIcon className="w-96 h-96 drop-shadow-2xl" />
              {/* Glow effect */}
              <div className="absolute inset-0 w-96 h-96 bg-[#28aeec]/8 blur-3xl rounded-full animate-pulse" />
            </motion.div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-16 relative main-content-grid">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Investment Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Token Pricing Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                      Investment Calculator
                    </h3>
                  </div>
                    
                    {/* Wallet Status */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ready && wallets.length > 0
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {ready && wallets.length > 0 
                        ? 'Wallet Connected' 
                        : 'Wallet Not Connected'}
                    </div>
                  </div>

                  {/* Business Information */}
                  {asset?.id.startsWith('business-') && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Blockchain Business</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Business ID:</span>
                          <span className="ml-2 text-blue-900">{asset.id.replace('business-', '')}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Type:</span>
                          <span className="ml-2 text-blue-900">Smart Contract</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Funding Goal:</span>
                          <span className="ml-2 text-blue-900">{asset?.totalRequired ? `${asset.totalRequired} USDC` : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Status:</span>
                          <span className={`ml-2 font-medium ${asset?.funded ? 'text-red-600' : 'text-green-600'}`}>
                            {asset?.funded ? 'Funded' : 'Open for Investment'}
                          </span>
                        </div>
                      </div>
                      
                      {/* User's Investment Status */}
                      {address && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">Your Investment Status</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-green-700 font-medium">Your Contribution:</span>
                              <span className="ml-2 text-green-900">{parseFloat(userContribution).toFixed(2)} USDC</span>
                            </div>
                            <div>
                              <span className="text-green-700 font-medium">Your Tokens:</span>
                              <span className="ml-2 text-green-900">{parseFloat(userTokenBalance).toFixed(2)} tokens</span>
                            </div>
                          </div>
                          
                          {/* Claim Button - TEMPORARY DEBUG VERSION */}
                          {asset?.funded && tokensMinted && (
                            <div className="mt-3">
                              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <strong>DEBUG INFO:</strong><br/>
                                Contribution: {parseFloat(userContribution).toFixed(2)} USDC<br/>
                                Token Balance: {parseFloat(userTokenBalance).toFixed(2)} tokens<br/>
                                Can Claim: {canClaimTokens ? 'YES' : 'NO'}
                              </div>
                              
                              {canClaimTokens ? (
                                <button
                                  onClick={handleClaimTokens}
                                  disabled={isClaiming}
                                  className={`w-full font-bold py-2 px-4 rounded-xl transition-all duration-300 transform font-poppins text-sm ${
                                    isClaiming 
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-500/90 hover:to-emerald-400/90 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40'
                                  } text-white`}
                                >
                                  {isClaiming ? 'Claiming...' : 'Claim Your Tokens'}
                                </button>
                              ) : (
                                <div className="w-full bg-gray-100 text-gray-600 font-bold py-2 px-4 rounded-xl text-center font-poppins text-sm">
                                  {parseFloat(userTokenBalance) > 0 ? 'Already Claimed' : 'Cannot Claim'}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Claim Status */}
                          {claimStatus && (
                            <div className={`mt-3 p-3 rounded-xl text-center font-poppins text-sm ${
                              claimStatus.includes('Error') 
                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                : claimStatus.includes('successfully')
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {claimStatus}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Receipt Management Section - Only for Business Owners */}
                      {isBusinessOwner && businessId !== null && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <h5 className="font-semibold text-purple-900 mb-3">Receipt Management</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Upload receipts to distribute yield automatically. 55% goes to you, 5% to platform, 40% to token holders.
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => router.push(`/receipt-upload?businessId=${businessId}`)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload Receipt
                            </button>
                            <ReceiptDashboard 
                              businessId={businessId!}
                              businessName={asset?.title || 'Business'}
                              isOwner={isBusinessOwner}
                            />
                          </div>
                        </div>
                      )}
                      
                      {asset?.funded && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-700 font-medium text-sm">
                              This business is fully funded and no longer accepting investments
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Number of Tokens
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {tokenQuantity}
                          </div>
                          <div className="text-sm text-gray-500">tokens</div>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-600">
                          Price per token
                        </div>
                        <div className="text-xl font-bold text-[#28aeec]">
                          ${asset.minimumInvestment} USDC
                        </div>
                      </div>
                    </div>

                    {/* Total Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Total Investment
                      </label>
                      <div className="bg-gradient-to-r from-[#28aeec]/10 to-sky-400/10 rounded-2xl p-6 border border-[#28aeec]/20">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-[#28aeec] mb-2">
                            ${totalValue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">USDC</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Button */}
                  <div className="mt-8">
                    {asset?.id.startsWith('business-') && asset?.funded ? (
                      <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 px-8 rounded-2xl text-center font-poppins uppercase tracking-wide">
                        Business Fully Funded
                      </div>
                    ) : (
                      <button 
                        onClick={handleInvestClick}
                        disabled={isInvesting}
                        className={`w-full font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform font-poppins uppercase tracking-wide ${
                          isInvesting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 hover:scale-105 hover:shadow-xl hover:shadow-[#28aeec]/40'
                        } text-white`}
                      >
                        {isInvesting ? 'Processing...' : `Invest ${totalValue.toFixed(2)} USDC`}
                    </button>
                    )}
                    
                    {/* Investment Status */}
                    {investmentStatus && (
                      <div className={`mt-4 p-4 rounded-xl text-center font-poppins ${
                        investmentStatus.includes('Error') 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : investmentStatus.includes('successful')
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {investmentStatus}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Why This Works Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                      Why This Works
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {(asset?.whyThisWorks || []).map((point: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IoCheckmarkCircle className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700 font-poppins leading-relaxed">
                          {point}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Location Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                      Location
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Map placeholder */}
                    <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FiMapPin className="w-12 h-12 mx-auto mb-2" />
                        <p>Interactive Map</p>
                        <p className="text-sm">
                          Lat: {asset.locationOnMap.lat}
                        </p>
                        <p className="text-sm">
                          Lng: {asset.locationOnMap.lng}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-900 font-poppins">
                            {asset.locationOnMap.address}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Region
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-900 font-poppins">
                            {asset.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Metrics & Info */}
              <div className="space-y-8">
                {/* Next Payout */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiClock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">
                      Next Payout
                    </h3>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#28aeec] mb-2">
                      {asset?.nextPayout ? formatNextPayout(asset.nextPayout) : '30d 0h 0m 0s'}
                    </div>
                    <p className="text-sm text-gray-600">
                      Until next distribution
                    </p>
                  </div>
                </motion.div>

                {/* Historical Yields */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full flex items-center justify-center">
                      <FiTrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">
                      Historical Yields
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Annual Yield
                      </span>
                      <span className="font-bold text-green-600">
                        {asset.annualYield}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Last 12 Months
                      </span>
                      <span className="font-bold text-green-600">
                        {(asset.annualYield - 1.2).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Last 6 Months
                      </span>
                      <span className="font-bold text-green-600">
                        {(asset.annualYield + 0.8).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Boring Index */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">
                      Boring Index
                    </h3>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {asset?.boringIndex || 5}/10
                    </div>
                    <p className="text-sm text-gray-600">Lower = More Stable</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(asset.boringIndex / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Power Saved */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                      <FiZap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">Environmental Impact</h3>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {(asset?.powerSaved?.amount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{asset?.powerSaved?.unit || 'N/A'}</div>
                    <p className="text-xs text-gray-500">Saved monthly</p>
                  </div>
                </motion.div>

                {/* Smart Contract */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                      <FiShield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">
                      Smart Contract
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Address
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 overflow-hidden">
                          {asset?.smartContractAddress ? 
                            `${asset.smartContractAddress.slice(0, 10)}...${asset.smartContractAddress.slice(-8)}` : 
                            'No contract address'
                          }
                        </code>
                        {asset?.smartContractAddress && (
                        <button
                          onClick={() =>
                            copyAddress(asset.smartContractAddress)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <BsCopy className="w-3 h-3 text-gray-500" />
                        </button>
                        )}
                      </div>
                    </div>
                    {copied && (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <IoCheckmarkCircle className="w-3 h-3" />
                        Copied to clipboard
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Proof Document */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-400 rounded-full flex items-center justify-center">
                      <FiFileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-space-grotesk">
                      Documentation
                    </h3>
                  </div>

                  {asset?.proof?.url ? (
                  <a
                      href={asset.proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-orange-500/10 to-red-400/10 hover:from-orange-500/20 hover:to-red-400/20 border border-orange-500/20 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiFileText className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{asset.proof.fileName}</div>
                        <div className="text-xs text-gray-500">Business Plan & Proof</div>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="block w-full bg-gray-100 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <FiFileText className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-500 text-sm">No documentation available</div>
                          <div className="text-xs text-gray-400">Documentation will be added soon</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualAssets;
