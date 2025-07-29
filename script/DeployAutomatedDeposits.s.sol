// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/AutomatedDeposits.sol";

contract DeployAutomatedDeposits is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying AutomatedDeposits...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

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