// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  // For ERC20 interface
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";  // For safe USDC transfers
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // For nonReentrant
import "./TokenMinterImpl.sol";  // To get token addresses
import "./BusinessRegistryImpl.sol";  // To get USDC token address

contract YieldDistributorImpl is Initializable, OwnableUpgradeable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    TokenMinterImpl public minter;
    BusinessRegistryImpl public registry;

    // Platform fee percentage (5% = 500 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 500;
    
    // Owner cut percentage (55% = 5500 basis points)
    uint256 public constant OWNER_CUT_BPS = 5500;
    
    // Token holder distribution percentage (40% = 4000 basis points)
    uint256 public constant TOKEN_HOLDER_BPS = 4000;

    // Platform fee collector address
    address public platformFeeCollector;

    // Receipt structure for yield uploads
    struct Receipt {
        uint256 businessId;
        uint256 amount; // Total amount in USDC (6 decimals)
        string receiptHash; // IPFS hash or URL of the receipt
        string description; // Description of the yield source
        uint256 timestamp;
        address uploadedBy; // Business owner who uploaded
    }

    // Receipt tracking
    mapping(uint256 => Receipt[]) public businessReceipts;
    mapping(uint256 => uint256) public receiptCounter;

    // Per business: accumulated yield per token (in USDC 6 decimals)
    mapping(uint256 => uint256) public rewardPerToken;

    // Per business, per user: last claimed rewardPerToken
    mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenClaimed;

    // Per business, per user: pending rewards (pre-calculated for efficiency)
    mapping(uint256 => mapping(address => uint256)) public pendingRewards;

    // Platform fee accumulation
    uint256 public totalPlatformFees;

    event YieldDeposited(uint256 indexed businessId, uint256 amount, string receiptHash);
    event YieldClaimed(uint256 indexed businessId, address indexed holder, uint256 amount);
    event ReceiptUploaded(uint256 indexed businessId, uint256 indexed receiptId, string receiptHash, uint256 amount);
    event PlatformFeeCollected(uint256 amount);
    event OwnerCutDistributed(uint256 indexed businessId, address indexed owner, uint256 amount);

    function initialize(address _minter, address _registry, address _platformFeeCollector) public initializer {
        __Ownable_init(msg.sender);
        minter = TokenMinterImpl(_minter);  // Link to TokenMinter for token addresses
        registry = BusinessRegistryImpl(_registry);  // Link to Registry for USDC token
        platformFeeCollector = _platformFeeCollector;
    }

    // Business owner uploads receipt and deposits yield with automatic distribution
    function uploadReceiptAndDistributeYield(
        uint256 businessId,
        uint256 amount,
        string calldata receiptHash,
        string calldata description
    ) external {
        require(amount > 0, "Amount must be positive");
        require(bytes(receiptHash).length > 0, "Receipt hash cannot be empty");
        
        // Verify caller is the business owner
        BusinessRegistryImpl.Business memory biz = registry.getBusiness(businessId);
        require(msg.sender == biz.owner, "Only business owner can upload receipts");

        // Transfer USDC from business owner to this contract
        registry.usdcToken().safeTransferFrom(msg.sender, address(this), amount);

        // Create receipt record
        uint256 receiptId = receiptCounter[businessId];
        businessReceipts[businessId].push(Receipt({
            businessId: businessId,
            amount: amount,
            receiptHash: receiptHash,
            description: description,
            timestamp: block.timestamp,
            uploadedBy: msg.sender
        }));
        receiptCounter[businessId]++;

        // Check if tokens exist for this business
        address tokenAddr = minter.getBusinessToken(businessId);
        bool hasTokens = tokenAddr != address(0);
        
        if (hasTokens) {
            IERC20 businessToken = IERC20(tokenAddr);
            uint256 totalSupply = businessToken.totalSupply();
            hasTokens = totalSupply > 0;
        }

        // Calculate distribution amounts
        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / 10000;
        uint256 ownerCut = (amount * OWNER_CUT_BPS) / 10000;
        uint256 tokenHolderAmount = hasTokens ? (amount * TOKEN_HOLDER_BPS) / 10000 : 0;
        
        // If no tokens, give the token holder portion to the owner
        if (!hasTokens) {
            ownerCut += (amount * TOKEN_HOLDER_BPS) / 10000;
        }

        // Distribute platform fee
        if (platformFee > 0) {
            registry.usdcToken().safeTransfer(platformFeeCollector, platformFee);
            totalPlatformFees += platformFee;
            emit PlatformFeeCollected(platformFee);
        }

        // Distribute owner cut
        if (ownerCut > 0) {
            registry.usdcToken().safeTransfer(biz.owner, ownerCut);
            emit OwnerCutDistributed(businessId, biz.owner, ownerCut);
        }

        // Distribute to token holders (only if tokens exist)
        if (tokenHolderAmount > 0) {
            rewardPerToken[businessId] += tokenHolderAmount;
        }

        emit ReceiptUploaded(businessId, receiptId, receiptHash, amount);
        emit YieldDeposited(businessId, tokenHolderAmount, receiptHash);
    }

    // Legacy function for backward compatibility (now calls uploadReceiptAndDistributeYield)
    function depositYield(uint256 businessId, uint256 amount) external {
        require(amount > 0, "Deposit amount must be positive");
        address tokenAddr = minter.getBusinessToken(businessId);
        require(tokenAddr != address(0), "No token for this business");

        IERC20 businessToken = IERC20(tokenAddr);
        uint256 totalSupply = businessToken.totalSupply();
        require(totalSupply > 0, "No tokens minted");

        // Verify caller is the business owner
        BusinessRegistryImpl.Business memory biz = registry.getBusiness(businessId);
        require(msg.sender == biz.owner, "Only business owner can deposit yield");

        // Transfer USDC from business owner to this contract
        registry.usdcToken().safeTransferFrom(msg.sender, address(this), amount);

        // Calculate distribution amounts
        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / 10000;
        uint256 ownerCut = (amount * OWNER_CUT_BPS) / 10000;
        uint256 tokenHolderAmount = (amount * TOKEN_HOLDER_BPS) / 10000;

        // Distribute platform fee
        if (platformFee > 0) {
            registry.usdcToken().safeTransfer(platformFeeCollector, platformFee);
            totalPlatformFees += platformFee;
            emit PlatformFeeCollected(platformFee);
        }

        // Distribute owner cut
        if (ownerCut > 0) {
            registry.usdcToken().safeTransfer(biz.owner, ownerCut);
            emit OwnerCutDistributed(businessId, biz.owner, ownerCut);
        }

        // Distribute to token holders
        if (tokenHolderAmount > 0) {
            rewardPerToken[businessId] += tokenHolderAmount;
        }

        emit YieldDeposited(businessId, tokenHolderAmount, "");
    }

    // Update pending rewards for a holder (internal)
    function _updatePending(uint256 businessId, address holder) internal {
        address tokenAddr = minter.getBusinessToken(businessId);
        require(tokenAddr != address(0), "No token for this business");

        IERC20 token = IERC20(tokenAddr);
        uint256 balance = token.balanceOf(holder);
        if (balance == 0) return;

        uint256 accumulated = rewardPerToken[businessId];
        uint256 claimed = userRewardPerTokenClaimed[businessId][holder];
        uint256 owed = (balance * (accumulated - claimed)) / token.totalSupply();

        pendingRewards[businessId][holder] += owed;
        userRewardPerTokenClaimed[businessId][holder] = accumulated;
    }

    // Holder claims their yield
    function claimYield(uint256 businessId) external nonReentrant {
        _updatePending(businessId, msg.sender);

        uint256 amount = pendingRewards[businessId][msg.sender];
        require(amount > 0, "No rewards to claim");

        pendingRewards[businessId][msg.sender] = 0;
        
        // Transfer USDC to the holder
        registry.usdcToken().safeTransfer(msg.sender, amount);

        emit YieldClaimed(businessId, msg.sender, amount);
    }

    // View pending rewards for a holder
    function getPendingYield(uint256 businessId, address holder) external view returns (uint256) {
        address tokenAddr = minter.getBusinessToken(businessId);
        if (tokenAddr == address(0)) return 0;

        IERC20 token = IERC20(tokenAddr);
        uint256 balance = token.balanceOf(holder);
        if (balance == 0) return 0;

        uint256 accumulated = rewardPerToken[businessId];
        uint256 claimed = userRewardPerTokenClaimed[businessId][holder];
        uint256 owed = (balance * (accumulated - claimed)) / token.totalSupply();

        return pendingRewards[businessId][holder] + owed;
    }

    // Get all receipts for a business
    function getBusinessReceipts(uint256 businessId) external view returns (Receipt[] memory) {
        return businessReceipts[businessId];
    }

    // Get specific receipt by business ID and receipt ID
    function getReceipt(uint256 businessId, uint256 receiptId) external view returns (Receipt memory) {
        require(receiptId < businessReceipts[businessId].length, "Receipt does not exist");
        return businessReceipts[businessId][receiptId];
    }

    // Get total number of receipts for a business
    function getReceiptCount(uint256 businessId) external view returns (uint256) {
        return businessReceipts[businessId].length;
    }

    // Owner can update platform fee collector address
    function setPlatformFeeCollector(address _platformFeeCollector) external onlyOwner {
        require(_platformFeeCollector != address(0), "Invalid address");
        platformFeeCollector = _platformFeeCollector;
    }

    // Calculate distribution amounts for a given total amount
    function calculateDistribution(uint256 totalAmount) external pure returns (
        uint256 platformFee,
        uint256 ownerCut,
        uint256 tokenHolderAmount
    ) {
        platformFee = (totalAmount * PLATFORM_FEE_BPS) / 10000;
        ownerCut = (totalAmount * OWNER_CUT_BPS) / 10000;
        tokenHolderAmount = (totalAmount * TOKEN_HOLDER_BPS) / 10000;
    }

    // Get platform fee statistics
    function getPlatformFeeStats() external view returns (uint256 totalFees, address collector) {
        return (totalPlatformFees, platformFeeCollector);
    }
}