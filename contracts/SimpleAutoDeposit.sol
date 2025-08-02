// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleAutoDeposit
 * @dev Simplified auto deposit contract for hackathon - just pulls tokens and deposits
 */
contract SimpleAutoDeposit is ReentrancyGuard, Ownable {
    address public depositTarget; // your vault or protocol
    
    // Events
    event AutoDepositExecuted(
        address indexed user,
        address indexed token,
        uint256 amount,
        address indexed target
    );
    
    constructor(address _depositTarget) Ownable(msg.sender) {
        depositTarget = _depositTarget;
    }
    
    /**
     * @dev Execute deposit on behalf of user (called by backend relayer)
     * @param user Address of the user 
     * @param token Token contract address
     * @param amount Amount to deposit (in token decimals)
     */
    function depositFor(
        address user,
        address token, 
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(user != address(0), "Invalid user address");
        require(token != address(0), "Invalid token address");
        
        // Pull tokens from user and transfer to deposit target
        IERC20(token).transferFrom(user, depositTarget, amount);
        
        emit AutoDepositExecuted(user, token, amount, depositTarget);
    }
    
    /**
     * @dev Update deposit target (where funds go)
     */
    function updateDepositTarget(address _newTarget) external onlyOwner {
        require(_newTarget != address(0), "Invalid target address");
        depositTarget = _newTarget;
    }
    
    /**
     * @dev Emergency function to withdraw any stuck tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}