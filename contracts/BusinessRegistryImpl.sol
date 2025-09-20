// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BusinessRegistryImpl is Initializable, OwnableUpgradeable {
    using SafeERC20 for IERC20;
    
    struct BusinessData {
        string name;
        uint256 fundingGoal;
        string equipmentList;
        string image;
        string description;
        string whyThisWorks;
        string location;
        string region;
        uint256 boringIndexNumber;
        string certificate;
        string yieldRange;
        string ownerContract;
    }

    struct Business {
        string name;
        uint256 fundingGoal; // Funding goal in USDC (6 decimals)
        string equipmentList;
        address owner;
        bool funded;
        uint256 totalRaised; // Total raised in USDC (6 decimals)
        string image; // Lighthouse image URL/IPFS hash
        string description; // Business description
        string whyThisWorks; // Why this business works explanation
        string location; // Physical location
        string region; // Geographic region
        uint256 boringIndexNumber; // Boring index number (1-10)
        string certificate; // Lighthouse certificate URL/IPFS hash
        string yieldRange; // Expected yield range (e.g., "8-12%")
        string ownerContract; // Owner contract address or reference
    }
    
    // USDC token address
    IERC20 public usdcToken;
    
    // Separate mapping for investor contributions
    mapping(uint256 => mapping(address => uint256)) public investorContributions;

    uint256 public businessCounter;
    mapping(uint256 => Business) public businesses;

    event BusinessSubmitted(uint256 indexed id, string name, uint256 fundingGoal, address owner, string description, string location, string region, uint256 boringIndexNumber, string yieldRange);
    event BusinessFunded(uint256 indexed id, address indexed investor, uint256 amount, uint256 totalRaised);

    // Initializer replaces constructor
    function initialize(address _usdcToken) public initializer {
        __Ownable_init(msg.sender);  // Sets deployer as owner
        usdcToken = IERC20(_usdcToken);
    }

    function submitBusiness(BusinessData calldata data) external {
        require(bytes(data.name).length > 0, "Name cannot be empty");
        require(bytes(data.description).length > 0, "Description cannot be empty");
        require(data.fundingGoal > 0, "Funding goal must be positive");
        require(data.boringIndexNumber >= 1 && data.boringIndexNumber <= 10, "Boring index must be between 1 and 10");

        uint256 newId = businessCounter;
        
        businesses[newId] = Business({
            name: data.name,
            fundingGoal: data.fundingGoal,
            equipmentList: data.equipmentList,
            owner: msg.sender,
            funded: false,
            totalRaised: 0,
            image: data.image,
            description: data.description,
            whyThisWorks: data.whyThisWorks,
            location: data.location,
            region: data.region,
            boringIndexNumber: data.boringIndexNumber,
            certificate: data.certificate,
            yieldRange: data.yieldRange,
            ownerContract: data.ownerContract
        });

        businessCounter++;
        emit BusinessSubmitted(newId, data.name, data.fundingGoal, msg.sender, data.description, data.location, data.region, data.boringIndexNumber, data.yieldRange);
    }

    // Investors can fund businesses directly with USDC
    function investInBusiness(uint256 id, uint256 amount) external {
        require(id < businessCounter, "Invalid ID");
        require(amount > 0, "Investment must be positive");
        
        Business storage business = businesses[id];
        require(!business.funded, "Business already funded");
        require(business.totalRaised + amount <= business.fundingGoal, "Exceeds funding goal");
        
        // Transfer USDC from investor to this contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        business.totalRaised += amount;
        investorContributions[id][msg.sender] += amount;
        
        // Check if funding goal is reached
        if (business.totalRaised >= business.fundingGoal) {
            business.funded = true;
        }
        
        emit BusinessFunded(id, msg.sender, amount, business.totalRaised);
    }
    
    // Business owner can withdraw funds once fully funded
    function withdrawFunds(uint256 id) external {
        require(id < businessCounter, "Invalid ID");
        Business storage business = businesses[id];
        require(business.funded, "Business not fully funded");
        require(msg.sender == business.owner, "Only business owner can withdraw");
        
        uint256 amount = business.totalRaised;
        business.totalRaised = 0; // Prevent double withdrawal
        
        // Transfer USDC to business owner
        usdcToken.safeTransfer(business.owner, amount);
    }

    function getBusiness(uint256 id) external view returns (Business memory) {
        require(id < businessCounter, "Invalid ID");
        return businesses[id];
    }
    
    function getInvestorContribution(uint256 id, address investor) external view returns (uint256) {
        return investorContributions[id][investor];
    }
}