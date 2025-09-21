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
import toast, { Toaster } from 'react-hot-toast';
import IndividualAssetSkeleton from './IndividualAssetSkeleton';
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
  const [businessImage, setBusinessImage] = useState<string>('');

  // Extract business ID from asset ID (format: "business-0", "business-1", etc.)
  const businessId = asset?.id.startsWith('business-')
  ? parseInt(asset.id.replace('business-', ''))
  : null;

  // Debug logging
  // console.log('IndividualAssets render:', {
  //   paramsTitle: params.title,
  //   blockchainLoading,
  //   blockchainAssetsLength: blockchainAssets.length,
  //   assetsDataLength: assetsData.length,
  //   asset: asset?.title || 'null',
  //   assetId: asset?.id,
  //   businessId,
  //   isBusinessAsset: asset?.id.startsWith('business-'),
  //   extractedId: asset?.id ? asset.id.replace('business-', '') : 'no asset id'
  // });

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
        console.log(business,"business")
        const isOwner = business?.owner.toLowerCase() === address!.toLowerCase();
        setIsBusinessOwner(isOwner || false);

        // Set business image if available
        if (business?.image) {
          setBusinessImage(business.image);
        }
        
        console.log('User status:', {
          businessId,
          contribution,
          tokenBalance,
          canClaim,
          minted,
          isOwner,
          
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

  const handleMapClick = () => {
    toast('🗺️ Interactive map coming soon!', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#28aeec44',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    });
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
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

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

      // console.log('Business ID validation:', {
      //   asset: asset,
      //   assetId: asset?.id,
      //   businessId,
      //   businessIdType: typeof businessId,
      //   isValid: businessId !== null && !isNaN(businessId) && businessId >= 0
      // });

      if (!businessId ) {
        throw new Error(`Invalid business ID.`);
      }

      // if (isNaN(businessId)) {
      //   throw new Error(`Business ID is not a number. Asset ID: ${asset?.id}, Extracted businessId: ${businessId}`);
      // }

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
      // console.log('Using signer for transaction:', signer.address);
      // console.log('Investment parameters:', {
      //   businessId,
      //   usdcAmount,
      //   totalValue,
      //   tokenQuantity,
      //   signerAddress: signer.address,
      //   networkChainId: network.chainId
      // });

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
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data,
        stack: error.stack
      });

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
    return <IndividualAssetSkeleton />;
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
            The asset you&apos;re looking for doesn&apos;t exist in our database.
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
            src={ asset?.mainImage || asset?.image || ''}
            alt={asset?.title  || 'Asset Image'}
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
          className="px-4 sm:px-6 lg:px-8 -mt-10 relative z-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black font-space-grotesk">
                  Funding Progress
                </h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#28aeec]">
                    {asset.fundingProgress}%
                  </div>
                  <div className="text-sm text-gray-600 font-poppins">
                    ${asset.totalRequired.toLocaleString()} target
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-white/80 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${asset?.fundingProgress || 0}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#28aeec] to-sky-400 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="flex font-poppins justify-between mt-2 text-sm text-gray-600">
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
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative main-content-grid">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Investment Details */}
              <div className="lg:col-span-2 space-y-6">
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
                    <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
                      <FiDollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                      Investment Calculator
                    </h3>
                  </div>
                    
                    {/* Wallet Status */}
                    <div className={`px-3 py-1 rounded-full text-sm font-poppins font-medium ${
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
                    <>
                      
                      {/* User's Investment Status */}
                      {address && (
                        <div className="my-4 p-3 bg-white border border-sky-200 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2 font-space-grotesk">Your Investment Status</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className=" font-medium font-poppins">Your Contribution:</span>
                              <span className="ml-2 text-[#28aeec] font-poppins">{parseFloat(userContribution).toFixed(2)} USDC</span>
                            </div>
                            <div>
                              <span className="text-black font-medium font-poppins">Your Tokens:</span>
                              <span className="ml-2 text-[#28aeec] font-poppins">{parseFloat(userTokenBalance).toFixed(2)} tokens</span>
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
                                      : 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-500/90 hover:to-emerald-400/90 hover:shadow-lg cursor-pointer hover:shadow-green-500/40'
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
                        <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-700 font-medium text-sm font-poppins">
                              This business is fully funded and no longer accepting investments
                            </span>
                          </div>
                        </div>
                      )}
                    {/* </div> */}
                    </>
                  )}

                  <div className="flex w-full gap-8">
                    {/* Token Selection */}
                    <div className='flex-1'>
                      <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">
                        Number of Tokens
                      </label>
                      <div className='bg-gradient-to-r from-[#28aeec]/10 to-sky-400/10 rounded-2xl p-6 border border-[#28aeec]/20'>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="size-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                        <div className="flex-1 text-center">
                          <input
                            type="number"
                            value={tokenQuantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setTokenQuantity(Math.max(1, value));
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setTokenQuantity(Math.max(1, value));
                            }}
                            className="text-xl font-bold text-gray-900 bg-transparent border-none text-center w-full focus:outline-none focus:ring-2 focus:ring-[#28aeec]/30 rounded-lg py-1"
                            min="1"
                          />
                          <div className="text-sm text-gray-500 font-poppins">tokens</div>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="size-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                     
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-600 font-poppins">
                          Price per token
                        </div>
                        <div className="text-xl font-bold text-[#28aeec]">
                          ${asset.minimumInvestment} USDC
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Total Value */}
                    <div className='flex-1'>
                      <label className="block text-sm font-medium text-gray-700 mb-3 font-poppins">
                        Total Investment
                      </label>
                      <div className="bg-gradient-to-r from-[#28aeec]/10 to-sky-400/10 rounded-2xl py-11 p-6 border border-[#28aeec]/20">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-[#28aeec] mb-2">
                            ${totalValue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 font-poppins">USDC</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Button */}
                  <div className="mt-8">
                    {asset?.id.startsWith('business-') && asset?.funded ? (
                      <div className="w-full bg-gray-100 text-gray-500 font-bold py-4 px-8 rounded-2xl text-center font-poppins uppercase tracking-wide cursor-not-allowed">
                        Business Fully Funded
                      </div>
                    ) : (
                      <button 
                        onClick={handleInvestClick}
                        disabled={isInvesting}
                        className={`w-full cursor-pointer font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform font-poppins uppercase tracking-wide ${
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
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                    <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
                      <FiTarget className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 font-space-grotesk">
                        Why This Works
                      </h3>
                      <p className="text-xs text-gray-600 font-poppins">
                        Key advantages and benefits
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0 pt-2">
                    {(asset?.whyThisWorks || []).map((point: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="pb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className=" bg-[#28aeec] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <IoCheckmarkCircle className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-gray-700 font-poppins leading-relaxed">
                            {point}
                          </p>
                        </div>
                        {index < (asset?.whyThisWorks || []).length - 1 && (
                          <div className="border-t border-gray-100 mt-3"></div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                
              </div>

              {/* Right Column - Unified Asset Information */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-black/5 rounded-3xl border border-gray-200 shadow-lg p-8 h-fit sticky top-8"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                  <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-space-grotesk">
                      Asset Overview
                    </h3>
                    <p className="text-xs text-gray-600 font-poppins">
                      Key metrics and information
                    </p>
                  </div>
                </div>
                <div className='border  border-black/5  mb-6'/>

                <div className="space-y-5">
                  {/* Next Payout */}
                  {/* <div className="flex items-start justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 font-space-grotesk">
                      Next Payout
                    </h4>
                    <div className="text-right">
                      <div className="flex flex-col text-xl font-bold text-[#28aeec]">
                        {asset?.nextPayout ? formatNextPayout(asset.nextPayout) : '30d 0h 0m 0s'}
                        <span className='text-black font-normal text-sm'>Until Next Distribution</span>
                      </div>
                    </div>
                  </div> */}
                  {/* <div className='border  border-black/5  mb-6'/> */}

                  {/* Performance Metrics */}
                  <div className="flex items-start justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 font-space-grotesk">
                      Performance
                    </h4>
                    <div className="text-right">
                      <div className="flex flex-col text-xl font-bold text-[#28aeec]">
                      {asset.annualYield}%
                        <span className='text-black font-normal text-sm'>Annual Yield</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    {/* Risk Assessment */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-poppins font-medium">
                        Boring Index
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {asset?.boringIndex || 5}/10
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-yellow-500 h-1.5 rounded-full"
                            style={{ width: `${(asset.boringIndex / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='border  border-black/5  mb-6'/>

                  {/* Investment Details */}
                  {/* <h4 className="text-lg font-semibold text-gray-900 font-space-grotesk">
                  Investment Info
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-gray-900 mb-1">
                          {asset.investorsCount}
                        </div>
                        <p className="text-sm text-gray-600 font-poppins">
                          Investors
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-[#28aeec] mb-1">
                          ${asset.minimumInvestment}
                        </div>
                        <p className="text-sm text-gray-600 font-poppins">
                          Min. Investment
                        </p>
                      </div>
                    </div> */}

                  {/* <div className='border  border-black/5  mb-6'/> */}



 {/* Technical */}
 <h4 className="text-lg font-semibold text-gray-900 font-space-grotesk">
                  Blockchain
                    </h4>
                    {asset?.smartContractAddress ? (
                      <>
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl">
                      <span className="text-sm text-gray-700 font-poppins font-medium">
                        Contract Address
                      </span>
                      <div className="flex items-center">
                      <code className="text-xs bg-gray-50 px-2 py-1.5 rounded-md flex-1 overflow-hidden font-mono">
                            {`${asset.smartContractAddress.slice(0, 6)}...${asset.smartContractAddress.slice(-4)}`}
                          </code>
                      <button
                            onClick={() => copyAddress(asset.smartContractAddress)}
                            className={`p-1.5 cursor-pointer hover:bg-gray-50 rounded-md transition-colors group ${copied? "text-[#28aeec]": "text-gray-400"}`}
                            title="Copy address"
                          >
                            <BsCopy className="w-3 h-3 text-gray-400 group-hover:text-sky-300" />
                          </button>
                      </div>
                    </div>
                    {copied && (
                          <div className="text-xs text-green-600 flex items-center justify-end gap-1 ml-auto mr-1">
                            <IoCheckmarkCircle className="w-3 h-3" />
                            <span className="font-poppins">Copied!</span>
                          </div>
                        )}
                        </>
                      ) : (
                        <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-900 font-poppins">
                          Traditional investment asset
                        </p>
                      </div>
                      )}
                  <div className='border  border-black/5  mb-6'/>

                  {/* Documentation */}
                  <h4 className="text-lg font-semibold text-gray-900 font-space-grotesk">
                    Documentation
                  </h4>

                  {asset?.proof?.url ? (
                    <a
                      href={asset.proof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white p-4 rounded-xl hover:shadow-sm transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                          <FiFileText className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm font-poppins group-hover:text-rose-700">
                            {asset.proof.fileName}
                          </div>
                          <div className="text-xs text-gray-500 font-poppins">
                            Business Plan
                          </div>
                        </div>
                      </div>
                      <FiArrowLeft className="w-4 h-4 text-gray-400 rotate-135 group-hover:text-rose-600 transition-colors" />
                    </a>
                  ) : (
                    <div className="bg-white rounded-xl p-4 text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FiFileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-500 text-sm font-poppins mb-1">
                        No documentation
                      </p>
                      <p className="text-xs text-gray-400 font-poppins">
                        Coming soon
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
             {/* Location Section */}
             <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-black/5 backdrop-blur-sm backdrop-saturate-150 rounded-3xl border border-white/40 ring-1 ring-black/10 ring-inset p-8 mt-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-full bg-gradient-to-r from-[#28aeec] to-sky-400 flex items-center justify-center text-white font-bold text-2xl font-poppins">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 font-space-grotesk">
                      Location
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Map placeholder */}
                    <div
                      className="bg-white rounded-2xl h-64 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={handleMapClick}
                    >
                      <div className="text-center text-gray-500">
                        <FiMapPin className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-space-grotesk">Interactive Map</p>
                        <p className="text-sm font-poppins">
                          Lat: {asset.locationOnMap.lat}
                        </p>
                        <p className="text-sm font-poppins">
                          Lng: {asset.locationOnMap.lng}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                          Address
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-900 font-poppins">
                            {asset.locationOnMap.address}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
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
                  <div></div>
                </motion.div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default IndividualAssets;
