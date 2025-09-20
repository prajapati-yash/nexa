// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 * This contract mimics USDC with 6 decimals
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;
    
    constructor() ERC20("Mock USD Coin", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**_DECIMALS); // 1M USDC
    }
    
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    // Function to mint tokens for testing
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Function to mint tokens for anyone (for testing)
    function mintForTesting(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
