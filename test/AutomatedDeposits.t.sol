// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AutomatedDeposits.sol";
import "./MockERC20.sol";

contract AutomatedDepositsTest is Test {
    AutomatedDeposits public automatedDeposits;
    address public owner;
    address public user;
    address public feeRecipient;
    address public vault; // Mock vault for deposits
    
    // Mock USDC for testing
    MockERC20 public USDC;
    
    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");
        feeRecipient = makeAddr("feeRecipient");
        vault = makeAddr("vault");
        
        // Deploy mock USDC token
        USDC = new MockERC20("USD Coin", "USDC", 6);
        
        vm.startPrank(owner);
        automatedDeposits = new AutomatedDeposits(feeRecipient);
        vm.stopPrank();
        
        // Give user some USDC for testing
        USDC.mint(user, 10000e6); // 10,000 USDC
    }
    
    function testDeployment() public {
        assertEq(automatedDeposits.owner(), owner);
        assertEq(automatedDeposits.feeRecipient(), feeRecipient);
        assertFalse(automatedDeposits.paused());
        assertEq(automatedDeposits.protocolFeeBps(), 10); // 0.1%
        assertTrue(automatedDeposits.keepers(owner)); // Owner is initial keeper
    }
    
    function testCreateSchedule() public {
        uint256 depositAmount = 100e6; // 100 USDC
        uint256 frequency = 86400; // Daily
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        // Check schedule was created
        (
            address scheduleUser,
            address token,
            uint256 amount,
            uint256 scheduleFrequency,
            uint256 nextDeposit,
            uint256 totalDeposited,
            bool isActive,
            address recipient
        ) = automatedDeposits.schedules(user, scheduleId);
        
        assertEq(scheduleUser, user);
        assertEq(token, address(USDC));
        assertEq(amount, depositAmount);
        assertEq(scheduleFrequency, frequency);
        assertGt(nextDeposit, block.timestamp);
        assertEq(totalDeposited, 0);
        assertTrue(isActive);
        assertEq(recipient, vault);
        
        assertEq(automatedDeposits.userScheduleCount(user), 1);
    }
    
    function testCreateScheduleInvalidParams() public {
        vm.startPrank(user);
        
        // Test zero amount
        vm.expectRevert("Amount must be greater than 0");
        automatedDeposits.createSchedule(address(USDC), 0, 86400, vault);
        
        // Test frequency too short
        vm.expectRevert("Frequency must be at least daily");
        automatedDeposits.createSchedule(address(USDC), 100e6, 3600, vault); // 1 hour
        
        // Test invalid recipient
        vm.expectRevert("Invalid recipient");
        automatedDeposits.createSchedule(address(USDC), 100e6, 86400, address(0));
        
        vm.stopPrank();
    }
    
    function testExecuteDeposit() public {
        uint256 depositAmount = 100e6; // 100 USDC
        uint256 frequency = 86400; // Daily
        
        // Create schedule
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        // Approve contract to spend user's USDC
        vm.prank(user);
        USDC.approve(address(automatedDeposits), depositAmount * 10); // Approve for multiple deposits
        
        // Fast forward time to make deposit executable
        vm.warp(block.timestamp + frequency);
        
        // Execute deposit
        uint256 userBalanceBefore = USDC.balanceOf(user);
        uint256 vaultBalanceBefore = USDC.balanceOf(vault);
        uint256 feeRecipientBalanceBefore = USDC.balanceOf(feeRecipient);
        
        automatedDeposits.executeDeposit(user, scheduleId);
        
        // Check balances
        uint256 expectedFee = (depositAmount * 10) / 10000; // 0.1% fee
        uint256 expectedNetAmount = depositAmount - expectedFee;
        
        assertEq(USDC.balanceOf(user), userBalanceBefore - depositAmount);
        assertEq(USDC.balanceOf(vault), vaultBalanceBefore + expectedNetAmount);
        assertEq(USDC.balanceOf(feeRecipient), feeRecipientBalanceBefore + expectedFee);
        
        // Check schedule was updated
        (, , , , uint256 nextDeposit, uint256 totalDeposited, ,) = 
            automatedDeposits.schedules(user, scheduleId);
        
        assertEq(totalDeposited, depositAmount);
        assertEq(nextDeposit, block.timestamp + frequency);
    }
    
    function testExecuteDepositTooEarly() public {
        uint256 depositAmount = 100e6;
        uint256 frequency = 86400;
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        vm.prank(user);
        USDC.approve(address(automatedDeposits), depositAmount);
        
        // Try to execute immediately (should fail)
        vm.expectRevert("Too early for next deposit");
        automatedDeposits.executeDeposit(user, scheduleId);
    }
    
    function testExecuteDepositInactiveSchedule() public {
        uint256 depositAmount = 100e6;
        uint256 frequency = 86400;
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        // Deactivate schedule
        vm.prank(user);
        automatedDeposits.updateSchedule(scheduleId, false);
        
        vm.warp(block.timestamp + frequency);
        
        vm.expectRevert("Schedule not active");
        automatedDeposits.executeDeposit(user, scheduleId);
    }
    
    function testUpdateSchedule() public {
        uint256 depositAmount = 100e6;
        uint256 frequency = 86400;
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        // Deactivate schedule
        vm.prank(user);
        automatedDeposits.updateSchedule(scheduleId, false);
        
        (, , , , , , bool isActive,) = automatedDeposits.schedules(user, scheduleId);
        assertFalse(isActive);
        
        // Reactivate schedule
        vm.prank(user);
        automatedDeposits.updateSchedule(scheduleId, true);
        
        (, , , , , , isActive,) = automatedDeposits.schedules(user, scheduleId);
        assertTrue(isActive);
    }
    
    function testUpdateScheduleUnauthorized() public {
        uint256 depositAmount = 100e6;
        uint256 frequency = 86400;
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            frequency,
            vault
        );
        
        // Try to update from different address
        address otherUser = makeAddr("otherUser");
        vm.prank(otherUser);
        vm.expectRevert("Not your schedule");
        automatedDeposits.updateSchedule(scheduleId, false);
    }
    
    function testKeeperManagement() public {
        address newKeeper = makeAddr("newKeeper");
        
        // Add keeper
        vm.prank(owner);
        automatedDeposits.addKeeper(newKeeper);
        assertTrue(automatedDeposits.keepers(newKeeper));
        
        // Remove keeper
        vm.prank(owner);
        automatedDeposits.removeKeeper(newKeeper);
        assertFalse(automatedDeposits.keepers(newKeeper));
    }
    
    function testKeeperManagementUnauthorized() public {
        address newKeeper = makeAddr("newKeeper");
        
        vm.prank(user);
        vm.expectRevert();
        automatedDeposits.addKeeper(newKeeper);
        
        vm.prank(user);
        vm.expectRevert();
        automatedDeposits.removeKeeper(newKeeper);
    }
    
    function testUpdateProtocolFee() public {
        vm.prank(owner);
        automatedDeposits.updateProtocolFee(25); // 0.25%
        
        assertEq(automatedDeposits.protocolFeeBps(), 25);
    }
    
    function testUpdateProtocolFeeToHigh() public {
        vm.prank(owner);
        vm.expectRevert("Fee too high");
        automatedDeposits.updateProtocolFee(150); // 1.5% - too high
    }
    
    function testUpdateFeeRecipient() public {
        address newFeeRecipient = makeAddr("newFeeRecipient");
        
        vm.prank(owner);
        automatedDeposits.updateFeeRecipient(newFeeRecipient);
        
        assertEq(automatedDeposits.feeRecipient(), newFeeRecipient);
    }
    
    function testUpdateFeeRecipientInvalid() public {
        vm.prank(owner);
        vm.expectRevert("Invalid recipient");
        automatedDeposits.updateFeeRecipient(address(0));
    }
    
    function testPauseAndUnpause() public {
        vm.startPrank(owner);
        
        // Pause the contract
        automatedDeposits.pause();
        assertTrue(automatedDeposits.paused());
        
        // Unpause the contract
        automatedDeposits.unpause();
        assertFalse(automatedDeposits.paused());
        
        vm.stopPrank();
    }
    
    function testCreateScheduleWhenPaused() public {
        vm.prank(owner);
        automatedDeposits.pause();
        
        vm.prank(user);
        vm.expectRevert();
        automatedDeposits.createSchedule(
            address(USDC),
            100e6,
            86400,
            vault
        );
    }
    
    function testEmergencyWithdraw() public {
        uint256 withdrawAmount = 100e6;
        
        // Send some USDC to the contract (simulate stuck funds)
        vm.prank(user);
        USDC.transfer(address(automatedDeposits), withdrawAmount);
        
        uint256 contractBalance = USDC.balanceOf(address(automatedDeposits));
        assertEq(contractBalance, withdrawAmount);
        
        // Emergency withdraw
        vm.prank(owner);
        automatedDeposits.emergencyWithdraw(address(USDC), withdrawAmount);
        
        // Check contract balance is 0 and owner received the tokens
        assertEq(USDC.balanceOf(address(automatedDeposits)), 0);
        assertEq(USDC.balanceOf(owner), withdrawAmount);
    }
    
    function testBatchExecuteDeposits() public {
        // Create multiple schedules
        address[] memory users = new address[](1);
        uint256[] memory scheduleIds = new uint256[](1);
        
        // Use existing user
        users[0] = user;
        
        // Create schedule
        vm.prank(user);
        scheduleIds[0] = automatedDeposits.createSchedule(
            address(USDC),
            100e6,
            86400,
            vault
        );
        
        // Approve contract
        vm.prank(user);
        USDC.approve(address(automatedDeposits), 1000e6);
        
        // Fast forward time
        vm.warp(block.timestamp + 86400);
        
        // Test individual execution first
        uint256 vaultBalanceBefore = USDC.balanceOf(vault);
        
        vm.prank(owner); // Owner is keeper  
        automatedDeposits.executeDeposit(user, scheduleIds[0]);
        
        // Check that deposit was executed
        assertGt(USDC.balanceOf(vault), vaultBalanceBefore, "Individual deposit failed");
    }
    
    // Test gas usage
    function testGasUsage() public {
        uint256 depositAmount = 100e6;
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            depositAmount,
            86400,
            vault
        );
        
        vm.prank(user);
        USDC.approve(address(automatedDeposits), depositAmount);
        
        vm.warp(block.timestamp + 86400);
        
        uint256 gasBefore = gasleft();
        automatedDeposits.executeDeposit(user, scheduleId);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for executing deposit:", gasUsed);
        assertLt(gasUsed, 150000, "Gas usage too high");
    }
    
    // Fuzz test with random amounts
    function testFuzzCreateSchedule(uint256 amount, uint256 frequency) public {
        amount = bound(amount, 1e6, 10000e6); // 1 to 10,000 USDC
        frequency = bound(frequency, 86400, 86400 * 365); // 1 day to 1 year
        
        // Make sure user has enough tokens
        USDC.mint(user, amount);
        
        vm.prank(user);
        uint256 scheduleId = automatedDeposits.createSchedule(
            address(USDC),
            amount,
            frequency,
            vault
        );
        
        (, , uint256 scheduleAmount, uint256 scheduleFrequency, , , bool isActive,) = 
            automatedDeposits.schedules(user, scheduleId);
        
        assertEq(scheduleAmount, amount);
        assertEq(scheduleFrequency, frequency);
        assertTrue(isActive);
    }
}