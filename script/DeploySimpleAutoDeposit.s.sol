// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/SimpleAutoDeposit.sol";

contract DeploySimpleAutoDeposit is Script {
    function run() external {
        // Aave V3 Pool on Polygon
        address aavePool = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
        
        console.log("Deploying SimpleAutoDeposit...");
        console.log("Chain ID:", block.chainid);
        console.log("Deposit Target (Aave Pool):", aavePool);

        // Start broadcast (will use the account specified in command line)
        vm.startBroadcast();

        // Deploy SimpleAutoDeposit with Aave pool as target
        SimpleAutoDeposit autoDeposit = new SimpleAutoDeposit(aavePool);
        
        console.log("SimpleAutoDeposit deployed at:", address(autoDeposit));
        console.log("Deposit target set to:", autoDeposit.depositTarget());
        
        vm.stopBroadcast();

        // Save deployment info
        string memory json = string(
            abi.encodePacked(
                '{"contractAddress":"',
                vm.toString(address(autoDeposit)),
                '","chainId":',
                vm.toString(block.chainid),
                ',"deployer":"',
                vm.toString(msg.sender),
                '","depositTarget":"',
                vm.toString(aavePool),
                '"}'
            )
        );
        
        vm.writeFile("./simple-auto-deposit-deployment.json", json);
        console.log("Deployment info saved to simple-auto-deposit-deployment.json");
        
        // Verification command
        console.log("To verify on Polygonscan, run:");
        console.log("forge verify-contract");
        console.log(vm.toString(address(autoDeposit)));
        console.log("contracts/SimpleAutoDeposit.sol:SimpleAutoDeposit");
        console.log("--chain-id 137");
        console.log("--constructor-args");
        console.log(vm.toString(abi.encode(aavePool)));
    }
}