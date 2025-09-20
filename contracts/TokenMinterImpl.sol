// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BusinessRegistryImpl.sol";

contract TokenMinterImpl is Initializable, OwnableUpgradeable {
    BusinessRegistryImpl public registry;
    mapping(uint256 => address) public businessToken;
    mapping(uint256 => uint256) public tokenSupplies;

    event TokensMinted(uint256 indexed businessId, address tokenAddress, uint256 supply);

    function initialize(address _registry) public initializer {
        __Ownable_init(msg.sender);
        registry = BusinessRegistryImpl(_registry);  // Map to Registry proxy
    }

    function mintForBusiness(uint256 businessId) external {
        BusinessRegistryImpl.Business memory biz = registry.getBusiness(businessId);
        require(biz.funded, "Business not funded yet");
        require(businessToken[businessId] == address(0), "Tokens already minted");

        uint256 totalSupply = biz.fundingGoal;  // 1 token = 1 USDC (both have same decimal precision)
        require(totalSupply > 0, "Invalid supply");

        string memory tokenName = string(abi.encodePacked(biz.name, " Token"));
        string memory tokenSymbol = string(abi.encodePacked("T", Strings.toString(businessId)));

        CustomERC20 newToken = new CustomERC20(tokenName, tokenSymbol, 0); // Start with 0 supply
        businessToken[businessId] = address(newToken);
        tokenSupplies[businessId] = totalSupply;

        // Distribute tokens to investors based on their contributions
        _distributeTokensToInvestors(businessId, newToken);
        
        emit TokensMinted(businessId, address(newToken), totalSupply);
    }
    
    function _distributeTokensToInvestors(uint256 businessId, CustomERC20 token) internal {
        // This is a simplified approach - in production, you'd need to track all investors
        // For now, we'll mint tokens to the contract and let investors claim them
        token.mint(address(this), tokenSupplies[businessId]);
    }
    
    // Investors can claim their tokens based on their contribution
    function claimTokens(uint256 businessId) external {
        require(businessToken[businessId] != address(0), "Tokens not minted yet");
        
        uint256 contribution = registry.getInvestorContribution(businessId, msg.sender);
        require(contribution > 0, "No contribution found");
        
        uint256 tokenAmount = contribution;  // 1 USDC = 1 token (same decimal precision)
        
        CustomERC20 token = CustomERC20(businessToken[businessId]);
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");
        
        token.transfer(msg.sender, tokenAmount);
    }

    function getBusinessToken(uint256 businessId) external view returns (address) {
        return businessToken[businessId];
    }
}

contract CustomERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply)
        ERC20(name, symbol)
    {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    // Override decimals to match USDC (6 decimals)
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}