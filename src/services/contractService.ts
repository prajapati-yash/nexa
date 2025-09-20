// Smart Contract Integration Service
// This service connects to your deployed contracts on Arbitrum Sepolia

import { ethers } from 'ethers';

// Contract addresses (Arbitrum Sepolia)
const CONTRACT_ADDRESSES = {
  REGISTRY: "0x14ffC2e3E49b6B6101e8877141B379EC3a5D2668",
  MINTER: "0x1889239D26E55fDD876296193a654A1E8Db6b4b9",
  YIELD_DISTRIBUTOR: "0x3BFbD96CFa56c87E9EF6F6D65AEBAFbe761ce1De", // Updated with receipt functionality (no token requirement)
  USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" // USDC token address
};

// Contract ABIs (simplified versions)
const REGISTRY_ABI = [
  "function getBusiness(uint256 id) external view returns (tuple(string name, uint256 fundingGoal, string equipmentList, address owner, bool funded, uint256 totalRaised, string image, string description, string whyThisWorks, string location, string region, uint256 boringIndexNumber, string certificate, string yieldRange, string ownerContract))",
  "function businessCounter() external view returns (uint256)",
  "function getInvestorContribution(uint256 id, address investor) external view returns (uint256)",
  "function investInBusiness(uint256 id, uint256 amount) external",
  "function submitBusiness(tuple(string name, uint256 fundingGoal, string equipmentList, string image, string description, string whyThisWorks, string location, string region, uint256 boringIndexNumber, string certificate, string yieldRange, string ownerContract) data) external"
];

const MINTER_ABI = [
  "function getBusinessToken(uint256 businessId) external view returns (address)",
  "function claimTokens(uint256 businessId) external",
  "function mintForBusiness(uint256 businessId) external"
];

const YIELD_DISTRIBUTOR_ABI = [
  "function rewardPerToken(uint256 businessId) external view returns (uint256)",
  "function getPendingYield(uint256 businessId, address holder) external view returns (uint256)",
  "function claimYield(uint256 businessId) external",
  "function depositYield(uint256 businessId, uint256 amount) external",
  "function uploadReceiptAndDistributeYield(uint256 businessId, uint256 amount, string calldata receiptHash, string calldata description) external",
  "function getBusinessReceipts(uint256 businessId) external view returns (tuple(uint256 businessId, uint256 amount, string receiptHash, string description, uint256 timestamp, address uploadedBy)[])",
  "function getReceipt(uint256 businessId, uint256 receiptId) external view returns (tuple(uint256 businessId, uint256 amount, string receiptHash, string description, uint256 timestamp, address uploadedBy))",
  "function getReceiptCount(uint256 businessId) external view returns (uint256)",
  "function calculateDistribution(uint256 totalAmount) external pure returns (uint256 platformFee, uint256 ownerCut, uint256 tokenHolderAmount)",
  "function getPlatformFeeStats() external view returns (uint256 totalFees, address collector)"
];

const ERC20_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// Business interface matching your smart contract
export interface Business {
  id: number;
  name: string;
  fundingGoal: string; // in USDC
  equipmentList: string;
  owner: string;
  funded: boolean;
  totalRaised: string; // in USDC
  image: string; // Lighthouse image URL/IPFS hash
  description: string; // Business description
  whyThisWorks: string; // Why this business works explanation
  location: string; // Physical location
  region: string; // Geographic region
  boringIndexNumber: number; // Boring index number (1-10)
  certificate: string; // Lighthouse certificate URL/IPFS hash
  yieldRange: string; // Expected yield range (e.g., "8-12%")
  ownerContract: string; // Owner contract address or reference
  tokenAddress?: string;
  tokenSupply?: string;
  rewardPerToken?: string;
  fundingProgress: number; // percentage
  status: 'active' | 'funded' | 'upcoming' | 'completed';
  annualYield?: number; // calculated from yield deposits
  investorsCount?: number;
  minimumInvestment: number; // in USDC
}

// Service class for contract interactions
export class ContractService {
  private provider: ethers.Provider;
  private registryContract: ethers.Contract;
  private minterContract: ethers.Contract;
  private yieldDistributorContract: ethers.Contract;
  private usdcContract: ethers.Contract;

  constructor() {
    // Use multiple provider endpoints for better reliability
    const alchemyUrl = "https://arb-sepolia.g.alchemy.com/v2/8eRw5isnshGewNcmFkaOmKIp49nPHQal";
    const publicUrl = "https://sepolia-rollup.arbitrum.io/rpc";
    
    this.provider = new ethers.JsonRpcProvider(alchemyUrl);
    
    // Initialize contracts
    this.registryContract = new ethers.Contract(CONTRACT_ADDRESSES.REGISTRY, REGISTRY_ABI, this.provider);
    this.minterContract = new ethers.Contract(CONTRACT_ADDRESSES.MINTER, MINTER_ABI, this.provider);
    this.yieldDistributorContract = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
    this.usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, this.provider);
  }

  // Get all businesses from the registry
  async getAllBusinesses(): Promise<Business[]> {
    try {
      const businessCounter = await this.registryContract.businessCounter();
      const businesses: Business[] = [];

      for (let i = 0; i < Number(businessCounter); i++) {
        const business = await this.getBusinessById(i);
        if (business) {
          businesses.push(business);
        }
      }

      return businesses;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
  }

  // Get a specific business by ID
  async getBusinessById(id: number): Promise<Business | null> {
    try {
      const businessData = await this.registryContract.getBusiness(id);
      
      // Get token information if available
      let tokenAddress = "";
      let tokenSupply = "0";
      let rewardPerToken = "0";
      
      try {
        tokenAddress = await this.minterContract.getBusinessToken(id);
        if (tokenAddress !== "0x0000000000000000000000000000000000000000") {
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
          tokenSupply = ethers.formatUnits(await tokenContract.totalSupply(), 6); // Use 6 decimals to match USDC
          rewardPerToken = ethers.formatUnits(await this.yieldDistributorContract.rewardPerToken(id), 6); // Use 6 decimals to match USDC
        }
      } catch (error) {
        console.log(`No token found for business ${id}`);
      }

      // Calculate funding progress
      const fundingProgress = businessData.totalRaised > 0 
        ? Math.min(100, (Number(ethers.formatUnits(businessData.totalRaised, 6)) / Number(ethers.formatUnits(businessData.fundingGoal, 6))) * 100)
        : 0;

      // Determine status
      let status: Business['status'] = 'active';
      if (businessData.funded) {
        status = 'funded';
      } else if (fundingProgress > 0) {
        status = 'active';
      } else {
        status = 'upcoming';
      }

      // Calculate annual yield (simplified calculation)
      const annualYield = tokenSupply !== "0" && rewardPerToken !== "0" 
        ? (Number(rewardPerToken) / Number(tokenSupply)) * 100 * 12 // Rough annual calculation
        : 0;

      return {
        id,
        name: businessData.name,
        fundingGoal: ethers.formatUnits(businessData.fundingGoal, 6),
        equipmentList: businessData.equipmentList,
        owner: businessData.owner,
        funded: businessData.funded,
        totalRaised: ethers.formatUnits(businessData.totalRaised, 6),
        image: businessData.image,
        description: businessData.description,
        whyThisWorks: businessData.whyThisWorks,
        location: businessData.location,
        region: businessData.region,
        boringIndexNumber: Number(businessData.boringIndexNumber),
        certificate: businessData.certificate,
        yieldRange: businessData.yieldRange,
        ownerContract: businessData.ownerContract,
        tokenAddress,
        tokenSupply,
        rewardPerToken,
        fundingProgress,
        status,
        annualYield,
        investorsCount: 0, // You'd need to track this separately
        minimumInvestment: 1 // Minimum investment in USDC (no minimum restriction)
      };
    } catch (error) {
      console.error(`Error fetching business ${id}:`, error);
      return null;
    }
  }

  // Get businesses by status
  async getBusinessesByStatus(status: Business['status']): Promise<Business[]> {
    const allBusinesses = await this.getAllBusinesses();
    return allBusinesses.filter(business => business.status === status);
  }

  // Get active businesses
  async getActiveBusinesses(): Promise<Business[]> {
    return this.getBusinessesByStatus('active');
  }

  // Get funded businesses
  async getFundedBusinesses(): Promise<Business[]> {
    return this.getBusinessesByStatus('funded');
  }

  // Submit a new business (requires wallet connection)
  async submitBusiness(
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
    ownerContract: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const registryWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.REGISTRY, REGISTRY_ABI, signer);
      
      const businessData = {
        name,
        fundingGoal: ethers.parseUnits(fundingGoal, 6), // Parse as USDC (6 decimals)
        equipmentList,
        image,
        description,
        whyThisWorks,
        location,
        region,
        boringIndexNumber,
        certificate,
        yieldRange,
        ownerContract
      };
      
      const tx = await registryWithSigner.submitBusiness(businessData);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error submitting business:', error);
      throw error;
    }
  }

  // Invest in a business (requires wallet connection)
  async investInBusiness(businessId: number, amount: string, signer: ethers.Signer): Promise<string> {
    try {
      console.log('ContractService: investInBusiness called with:', {
        businessId,
        amount,
        signerAddress: await signer.getAddress()
      });
      
      // First approve USDC spending
      const usdcWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
      const amountWei = ethers.parseUnits(amount, 6); // Parse as USDC (6 decimals)
      
      // Check current allowance
      const allowance = await usdcWithSigner.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.REGISTRY);
      
      if (allowance < amountWei) {
        console.log('Approving USDC spending...');
        const approveTx = await usdcWithSigner.approve(CONTRACT_ADDRESSES.REGISTRY, amountWei);
        await approveTx.wait();
        console.log('USDC approval successful');
      }
      
      // Create a new contract instance with the signer
      const registryWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.REGISTRY, REGISTRY_ABI, signer);
      
      // First, let's try to estimate gas to see if there are any issues
      try {
        const gasEstimate = await registryWithSigner.investInBusiness.estimateGas(businessId, amountWei);
        console.log('Gas estimate successful:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        throw gasError;
      }
      
      const tx = await registryWithSigner.investInBusiness(businessId, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error investing in business:', error);
      throw error;
    }
  }

  // Mint tokens for a business (requires wallet connection)
  async mintTokensForBusiness(businessId: number, signer: ethers.Signer): Promise<string> {
    try {
      console.log('ContractService: mintTokensForBusiness called with:', {
        businessId,
        signerAddress: await signer.getAddress()
      });
      
      const minterWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.MINTER, MINTER_ABI, signer);
      const tx = await minterWithSigner.mintForBusiness(businessId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error minting tokens for business:', error);
      throw error;
    }
  }

  // Deposit yield (requires wallet connection)
  async depositYield(businessId: number, amount: string, signer: ethers.Signer): Promise<string> {
    try {
      // First approve USDC spending
      const usdcWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
      const amountWei = ethers.parseUnits(amount, 6); // Parse as USDC (6 decimals)
      
      // Check current allowance
      const allowance = await usdcWithSigner.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR);
      
      if (allowance < amountWei) {
        console.log('Approving USDC spending for yield deposit...');
        const approveTx = await usdcWithSigner.approve(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, amountWei);
        await approveTx.wait();
        console.log('USDC approval successful');
      }
      
      const yieldDistributorWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, signer);
      const tx = await yieldDistributorWithSigner.depositYield(businessId, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error depositing yield:', error);
      throw error;
    }
  }

  // Claim yield (requires wallet connection)
  async claimYield(businessId: number, signer: ethers.Signer): Promise<string> {
    try {
      const yieldDistributorWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, signer);
      const tx = await yieldDistributorWithSigner.claimYield(businessId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming yield:', error);
      throw error;
    }
  }

  // Upload receipt and distribute yield (requires wallet connection)
  async uploadReceiptAndDistributeYield(
    businessId: number, 
    amount: string, 
    receiptHash: string, 
    description: string, 
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const amountWei = ethers.parseUnits(amount, 6); // Convert to USDC decimals (6)
      
      // First approve USDC spending with robust error handling
      console.log('Checking USDC allowance...');
      const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
      const usdcWithSigner = usdcContract.connect(signer) as any;
      
      try {
        // Check current allowance with retry mechanism
        let allowance;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            allowance = await usdcWithSigner.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR);
            console.log(`Current allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
            break; // Success, exit retry loop
          } catch (retryError: any) {
            retryCount++;
            console.log(`Allowance check attempt ${retryCount} failed:`, retryError.message);
            
            if (retryCount >= maxRetries) {
              // If all retries failed, try a different approach
              console.log('All retry attempts failed. Trying alternative approach...');
              
              // Try to get allowance using a fresh contract instance
              const freshUsdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
              allowance = await freshUsdcContract.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR);
              console.log(`Allowance via fresh contract: ${ethers.formatUnits(allowance, 6)} USDC`);
              break;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (allowance < amountWei) {
          console.log('Insufficient allowance. Requesting approval...');
          
          // Request approval for the exact amount needed
          const approveTx = await usdcWithSigner.approve(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, amountWei);
          console.log('Approval transaction sent:', approveTx.hash);
          
          // Wait for confirmation
          await approveTx.wait();
          console.log('USDC approval confirmed');
          
          // Verify the approval went through
          const newAllowance = await usdcWithSigner.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR);
          console.log(`New allowance: ${ethers.formatUnits(newAllowance, 6)} USDC`);
          
          if (newAllowance < amountWei) {
            throw new Error('Approval failed - insufficient allowance after approval');
          }
        } else {
          console.log('Sufficient allowance already exists');
        }
      } catch (approvalError: any) {
        console.error('Error in approval process:', approvalError);
        if (approvalError.message.includes('missing revert data')) {
          throw new Error('USDC contract call failed. Please check your wallet connection and try again.');
        }
        throw new Error(`Approval failed: ${approvalError.message}`);
      }

      console.log('Proceeding with receipt upload...');

      const yieldDistributorWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, signer);
      const tx = await yieldDistributorWithSigner.uploadReceiptAndDistributeYield(
        businessId, 
        amountWei,
        receiptHash, 
        description
      );
      
      console.log('Receipt upload transaction sent:', tx.hash);
      await tx.wait();
      console.log('Receipt upload confirmed');
      
      return tx.hash;
    } catch (error) {
      console.error('Error uploading receipt and distributing yield:', error);
      throw error;
    }
  }

  // Get business receipts (view function)
  async getBusinessReceipts(businessId: number): Promise<any[]> {
    try {
      const yieldDistributor = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
      const receipts = await yieldDistributor.getBusinessReceipts(businessId);
      return receipts;
    } catch (error) {
      console.error('Error fetching business receipts:', error);
      throw error;
    }
  }

  // Get specific receipt (view function)
  async getReceipt(businessId: number, receiptId: number): Promise<any> {
    try {
      const yieldDistributor = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
      const receipt = await yieldDistributor.getReceipt(businessId, receiptId);
      return receipt;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }

  // Get receipt count (view function)
  async getReceiptCount(businessId: number): Promise<number> {
    try {
      const yieldDistributor = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
      const count = await yieldDistributor.getReceiptCount(businessId);
      return Number(count);
    } catch (error) {
      console.error('Error fetching receipt count:', error);
      throw error;
    }
  }

  // Calculate distribution amounts (view function)
  async calculateDistribution(totalAmount: string): Promise<{
    platformFee: string;
    ownerCut: string;
    tokenHolderAmount: string;
  }> {
    try {
      const yieldDistributor = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
      const [platformFee, ownerCut, tokenHolderAmount] = await yieldDistributor.calculateDistribution(
        ethers.parseUnits(totalAmount, 6)
      );
      
      return {
        platformFee: ethers.formatUnits(platformFee, 6),
        ownerCut: ethers.formatUnits(ownerCut, 6),
        tokenHolderAmount: ethers.formatUnits(tokenHolderAmount, 6)
      };
    } catch (error) {
      console.error('Error calculating distribution:', error);
      throw error;
    }
  }

  // Get platform fee statistics (view function)
  async getPlatformFeeStats(): Promise<{
    totalFees: string;
    collector: string;
  }> {
    try {
      const yieldDistributor = new ethers.Contract(CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR, YIELD_DISTRIBUTOR_ABI, this.provider);
      const [totalFees, collector] = await yieldDistributor.getPlatformFeeStats();
      
      return {
        totalFees: ethers.formatUnits(totalFees, 6),
        collector: collector
      };
    } catch (error) {
      console.error('Error fetching platform fee stats:', error);
      throw error;
    }
  }

  // Claim tokens (requires wallet connection)
  async claimTokens(businessId: number, signer: ethers.Signer): Promise<string> {
    try {
      console.log('ContractService: claimTokens called with:', {
        businessId,
        signerAddress: await signer.getAddress()
      });
      
      // First check if tokens are available for claiming
      const canClaim = await this.canClaimTokens(businessId, await signer.getAddress());
      if (!canClaim) {
        throw new Error('No tokens available for claiming. You may not have contributed to this business or tokens may not be minted yet.');
      }
      
      const minterWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.MINTER, MINTER_ABI, signer);
      
      // Estimate gas first
      try {
        const gasEstimate = await minterWithSigner.claimTokens.estimateGas(businessId);
        console.log('Gas estimate for claimTokens successful:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed for claimTokens:', gasError);
        throw new Error('Cannot claim tokens. Please ensure tokens are minted and you have contributed to this business.');
      }
      
      const tx = await minterWithSigner.claimTokens(businessId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
  }

  // Get user's token balance for a specific business
  async getUserTokenBalance(businessId: number, address: string): Promise<string> {
    try {
      const tokenAddress = await this.minterContract.getBusinessToken(businessId);
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        return "0"; // No tokens minted yet
      }
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, 6); // Use 6 decimals to match USDC
    } catch (error) {
      console.error('Error getting user token balance:', error);
      return "0";
    }
  }

  // Get user's contribution to a business
  async getUserContribution(businessId: number, address: string): Promise<string> {
    try {
      const contribution = await this.registryContract.getInvestorContribution(businessId, address);
      return ethers.formatUnits(contribution, 6); // USDC has 6 decimals
    } catch (error) {
      console.error('Error getting user contribution:', error);
      return "0";
    }
  }

  // Check if business tokens are minted
  async areTokensMinted(businessId: number): Promise<boolean> {
    try {
      const tokenAddress = await this.minterContract.getBusinessToken(businessId);
      return tokenAddress !== "0x0000000000000000000000000000000000000000";
    } catch (error) {
      console.error('Error checking if tokens are minted:', error);
      return false;
    }
  }

  // // Automatically mint tokens for a fully funded business
  // async mintTokensForBusiness(businessId: number, signer: any): Promise<string> {
  //   try {
  //     const minterWithSigner = new ethers.Contract(CONTRACT_ADDRESSES.MINTER, MINTER_ABI, signer);
      
  //     // Check if tokens are already minted
  //     const tokenAddress = await minterWithSigner.getBusinessToken(businessId);
  //     if (tokenAddress !== "0x0000000000000000000000000000000000000000") {
  //       throw new Error('Tokens already minted for this business');
  //     }
      
  //     // Mint tokens for the business
  //     const tx = await minterWithSigner.mintForBusiness(businessId);
  //     await tx.wait();
      
  //     return tx.hash;
  //   } catch (error: any) {
  //     console.error('Error minting tokens:', error);
  //     throw new Error(`Failed to mint tokens: ${error.message}`);
  //   }
  // }

  // Check if tokens are available for claiming
  async canClaimTokens(businessId: number, address: string): Promise<boolean> {
    try {
      const tokenAddress = await this.minterContract.getBusinessToken(businessId);
      console.log('canClaimTokens debug:', {
        businessId,
        address,
        tokenAddress,
        tokensMinted: tokenAddress !== "0x0000000000000000000000000000000000000000"
      });
      
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        console.log('canClaimTokens: No tokens minted yet');
        return false; // No tokens minted yet
      }
      
      const contribution = await this.registryContract.getInvestorContribution(businessId, address);
      console.log('canClaimTokens debug:', {
        contribution: ethers.formatUnits(contribution, 6),
        hasContribution: contribution > 0
      });
      
      if (contribution === 0) {
        console.log('canClaimTokens: No contribution');
        return false; // No contribution
      }
      
      // Check if user already has tokens
      const tokenContract = new ethers.Contract(tokenAddress, [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)"
      ], this.provider);
      
      const userBalance = await tokenContract.balanceOf(address);
      const userBalanceFormatted = ethers.formatUnits(userBalance, 6);
      
      console.log('canClaimTokens debug:', {
        userBalance: userBalanceFormatted,
        userBalanceRaw: userBalance.toString(),
        canClaim: userBalance === BigInt(0)
      });
      
      // Can claim if they have contribution but no tokens yet
      const result = userBalance === BigInt(0);
      console.log('canClaimTokens result:', result);
      return result;
    } catch (error) {
      console.error('Error checking if tokens can be claimed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const contractService = new ContractService();

// Helper functions
export const formatBusinessForUI = (business: Business) => {
  return {
    id: `business-${business.id}`,
    image: business.image || "/api/placeholder/400/300",
    mainImage: business.image || "/api/placeholder/800/600",
    title: business.name, // Use name as title
    description: business.description || business.equipmentList || "Real-world asset investment opportunity",
    annualYield: business.annualYield || 0,
    boringIndex: business.boringIndexNumber || 5,
    location: business.location || "Decentralized",
    region: business.region || "Global",
    usdcValue: Number(business.fundingGoal), // USDC value (already in USDC)
    nextPayout: { days: 30, hours: 0, minutes: 0, seconds: 0 }, // Default payout
    powerSaved: { amount: 0, unit: "N/A" },
    whyThisWorks: business.whyThisWorks ? business.whyThisWorks.split('\n').filter(line => line.trim()) : [
      "Decentralized investment platform",
      "Transparent smart contract execution",
      "Proportional token distribution",
      "Automated yield distribution"
    ],
    locationOnMap: {
      lat: 0,
      lng: 0,
      address: business.location || "Blockchain"
    },
    smartContractAddress: business.tokenAddress || "",
    ownerContract: business.ownerContract || "",
    proof: {
      fileName: business.certificate ? `${business.name}_Certificate.pdf` : `${business.name}_Contract.pdf`,
      url: business.certificate || `https://sepolia.arbiscan.io/address/${business.tokenAddress}`
    },
    category: "RWA Investment",
    fundingProgress: business.fundingProgress,
    minimumInvestment: business.minimumInvestment,
    totalRequired: Number(business.fundingGoal),
    investorsCount: business.investorsCount || 0,
    status: business.status,
    funded: business.funded,
    yieldRange: business.yieldRange || "8-12%"
  };
};
