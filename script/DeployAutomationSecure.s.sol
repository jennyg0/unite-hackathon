// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/AutomatedDeposits.sol";

contract DeployAutomationSecure is Script {
    function run() external {
        address deployer = msg.sender;

        console.log("==================================================");
        console.log(" Deploying AutomatedDeposits to Polygon");
        console.log("==================================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "MATIC");
        console.log("");

        require(
            deployer.balance >= 0.1 ether,  
            "Insufficient MATIC balance for deployment"
        );

        vm.startBroadcast();

        // Deploy the AutomatedDeposits contract
        console.log(" Deploying AutomatedDeposits contract...");
        AutomatedDeposits automation = new AutomatedDeposits(deployer);

        console.log(" Contract deployed successfully!");
        console.log(" Contract address:", address(automation));
        console.log("");

        // Set up initial configuration
        console.log("  Setting up initial configuration...");

        // Set fee recipient to deployer (can be changed later)
        automation.updateFeeRecipient(deployer);

        // Add deployer as a keeper (for testing)
        automation.addKeeper(deployer);

        // Set protocol fee to 0.1% (10 basis points)
        automation.updateProtocolFee(10);

        console.log("Fee recipient set to:", deployer);
        console.log("Deployer added as keeper");
        console.log("Protocol fee set to 0.1%");
        console.log("");

        // Verify contract state
        console.log(" Verifying contract deployment...");
        console.log("Owner:", automation.owner());
        console.log("Fee recipient:", automation.feeRecipient());
        console.log("Protocol fee (bps):", automation.protocolFeeBps());
        console.log("Is deployer keeper:", automation.keepers(deployer));
        console.log("Contract paused:", automation.paused());
        console.log("");

        // Optional: Create test schedule if environment variable is set
        if (vm.envOr("CREATE_TEST_SCHEDULE", false)) {
            console.log(" Creating test schedule...");

            // Native USDC on Polygon (corrected address)
            address usdcPolygon = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;

            // Test recipient (Aave V3 Pool for production)
            address testRecipient = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;

            try
                automation.createSchedule(
                    usdcPolygon,
                    1000000, // 1 USDC (6 decimals)
                    86400, // Daily (1 day in seconds)
                    testRecipient
                )
            returns (uint256 scheduleId) {
                console.log("Test schedule created! Schedule ID:", scheduleId);

                // Check the schedule and use all returned values
                (
                    address user,
                    address token,
                    uint256 amount,
                    uint256 frequency,
                    uint256 nextDeposit,
                    uint256 totalDeposited,
                    bool isActive,
                    address recipient
                ) = automation.schedules(deployer, scheduleId);

                console.log("Schedule user:", user);
                console.log("Schedule token:", token);
                console.log("Schedule amount:", amount);
                console.log("Schedule frequency:", frequency, "seconds");
                console.log("Next deposit:", nextDeposit);
                console.log("Total deposited:", totalDeposited);
                console.log("Schedule active:", isActive);
                console.log("Recipient:", recipient);
            } catch {
                console.log(
                    " Test schedule creation failed (expected - no USDC balance)"
                );
            }
        }

        vm.stopBroadcast();

        console.log(" Next Steps:");
        console.log("1. Update automated-deposits.ts with contract address:");
        console.log("   137: '%s' as Address,", address(automation));
        console.log("");
        console.log("2. Update gelato-automation.ts with contract address:");
        console.log(
            "   AUTOMATED_DEPOSITS_CONTRACT = '%s';",
            address(automation)
        );
        console.log("");
        console.log("3. Set up Gelato automation:");
        console.log("   - Fund automation wallet with MATIC");
        console.log("   - Configure keepers for production");
        console.log("");
        console.log("4. Connect to DeFi protocols:");
        console.log("   - Default recipient set to Aave V3 Pool");
        console.log("   - Ready for USDC deposits to earn yield");
        console.log("");
        console.log("5. Verify contract on PolygonScan (optional):");
        console.log(
            'forge verify-contract %s AutomatedDeposits --chain polygon --constructor-args $(cast abi-encode "constructor(address)" %s)',
            address(automation),
            deployer
        );
        console.log("");
        console.log(" Automation deployment complete!");
        console.log("==================================================");
    }
}