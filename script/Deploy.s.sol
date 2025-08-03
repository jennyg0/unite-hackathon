// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/ByobMilestoneNFT.sol";

contract DeployScript is Script {
    function run() external {
        address deployer = msg.sender;

        console.log("==================================================");
        console.log(" Deploying BYOB Milestone NFT to Polygon Chain");
        console.log("==================================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "MATIC");
        console.log("");

        require(
            deployer.balance >= 0.01 ether,
            "Insufficient balance for deployment"
        );

        vm.startBroadcast();

        // Deploy the NFT contract
        console.log(" Deploying ByobMilestoneNFT contract...");
        ByobMilestoneNFT nft = new ByobMilestoneNFT();

        console.log("Contract deployed successfully!");
        console.log(" Contract address:", address(nft));
        console.log("");

        // Verify contract state
        console.log(" Verifying contract deployment...");
        console.log("Name:", nft.name());
        console.log("Symbol:", nft.symbol());
        console.log("Owner:", nft.owner());
        console.log("Total milestones:", nft.totalMilestones());
        console.log("");

        // Optional: Mint test NFT if environment variable is set
        if (vm.envOr("MINT_TEST_NFT", false)) {
            console.log(" Minting test NFT...");
            nft.mintMilestone(
                deployer,
                4, // EARLY_ADOPTER
                1,
                "BYOB Pioneer",
                "Early adopter of the BYOB platform",
                "ipfs://QmTestHash123" // Replace with real IPFS hash later
            );

            bool hasEarned = nft.hasEarnedMilestone(deployer, 4);
            uint256 totalMinted = nft.totalMilestones();

            console.log("Test NFT minted! Token ID:", totalMinted);
            console.log("Has earned milestone:", hasEarned);
            console.log("");
        }

        vm.stopBroadcast();

        console.log(" Next Steps:");
        console.log("1. Update milestone-nft.ts with contract address:");
        console.log("   137: { nft: '%s' as Address },", address(nft));
        console.log("");
        console.log("2. Verify contract on PolygonScan (optional):");
        console.log(
            "   forge verify-contract %s ByobMilestoneNFT --chain polygon",
            address(nft)
        );
        console.log("");
        console.log(" Deployment complete!");
        console.log("==================================================");
    }
}
