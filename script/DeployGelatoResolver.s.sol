// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/GelatoResolver.sol";

contract DeployGelatoResolverScript is Script {
    function run() external {
        address deployer = msg.sender;
        
        // AutomatedDeposits contract address on Polygon
        address automatedDepositsAddress = 0x40D8364e7FB4BF12870f5ADBA5DAe206354bD6ED;

        console.log("==================================================");
        console.log(" Deploying GelatoResolver to Polygon");
        console.log("==================================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "MATIC");
        console.log("AutomatedDeposits address:", automatedDepositsAddress);
        console.log("");

        require(
            deployer.balance >= 0.05 ether,
            "Insufficient MATIC balance for deployment"
        );

        vm.startBroadcast();

        // Deploy the GelatoResolver contract
        console.log(" Deploying GelatoResolver contract...");
        GelatoResolver resolver = new GelatoResolver(automatedDepositsAddress);

        console.log(" GelatoResolver deployed successfully!");
        console.log(" Contract address:", address(resolver));
        console.log("");

        // Verify the deployment
        console.log(" Verifying contract deployment...");
        console.log("AutomatedDeposits reference:", address(resolver.automatedDeposits()));
        console.log("");

        // Test the resolver with mock data (if test environment variable is set)
        if (vm.envOr("TEST_RESOLVER", false)) {
            console.log(" Testing resolver functionality...");
            
            // Create test arrays
            address[] memory testUsers = new address[](1);
            uint256[] memory testScheduleIds = new uint256[](1);
            testUsers[0] = deployer;
            testScheduleIds[0] = 0;
            
            try resolver.checker(testUsers, testScheduleIds) returns (
                bool canExec, 
                bytes memory execPayload
            ) {
                console.log("Resolver test successful!");
                console.log("Can execute:", canExec);
                console.log("Exec payload length:", execPayload.length);
            } catch {
                console.log(" Resolver test failed (expected - no active schedules)");
            }
        }

        vm.stopBroadcast();

        console.log(" Next Steps for Gelato Integration:");
        console.log("1. Create Gelato task using this resolver:");
        console.log("   - Resolver address: %s", address(resolver));
        console.log("   - Use 'checker' function for automation");
        console.log("");
        console.log("2. Recommended check frequency:");
        console.log("   - Every 6 hours (21600 seconds) for gas efficiency");
        console.log("   - Or every 12 hours (43200 seconds) for maximum efficiency");
        console.log("");
        console.log("3. Gelato task configuration:");
        console.log("   - Target contract: %s", automatedDepositsAddress);
        console.log("   - Resolver contract: %s", address(resolver));
        console.log("   - Function: checker(address[],uint256[])");
        console.log("");
        console.log("4. Gas cost optimization:");
        console.log("   - Each check costs ~30,000 gas");
        console.log("   - 6-hour intervals = 4 checks/day = ~$0.50/day");
        console.log("   - 12-hour intervals = 2 checks/day = ~$0.25/day");
        console.log("");
        console.log(" GelatoResolver deployment complete!");
        console.log("==================================================");
    }
}