// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AutomatedDeposits.sol";

contract DeployAutomatedDepositsOnly is Script {
    function run() external {
        address deployer = msg.sender;
        
        console.log("Deploying AutomatedDeposits...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast();

        // Deploy with deployer as fee recipient initially
        AutomatedDeposits automatedDeposits = new AutomatedDeposits(deployer);
        
        console.log("AutomatedDeposits deployed at:", address(automatedDeposits));
        
        vm.stopBroadcast();

        // Save deployment info
        string memory json = string(
            abi.encodePacked(
                '{"contractAddress":"',
                vm.toString(address(automatedDeposits)),
                '","chainId":',
                vm.toString(block.chainid),
                ',"deployer":"',
                vm.toString(deployer),
                '"}'
            )
        );
        
        vm.writeFile("./deployment.json", json);
        console.log("Deployment info saved to deployment.json");
    }
}