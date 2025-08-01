// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BYOB Milestone NFT
 * @dev NFT contract for BYOB achievement milestones
 * Supports 5 milestone types with metadata stored on IPFS
 */
contract ByobMilestoneNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Milestone types
    enum MilestoneType {
        FIRST_DEPOSIT,      // 0 - Make your first deposit
        SAVINGS_STREAK,     // 1 - Set up automated deposit  
        EDUCATION_COMPLETE, // 2 - Complete first education module
        AMOUNT_SAVED,       // 3 - Reach $100 in savings
        EARLY_ADOPTER       // 4 - BYOB Pioneer
    }
    
    // Track which milestones each user has earned
    mapping(address => mapping(uint8 => bool)) public hasAchieved;
    
    // Track milestone data for each token
    mapping(uint256 => MilestoneData) public milestoneData;
    
    struct MilestoneData {
        MilestoneType milestoneType;
        uint256 value;
        uint256 achievementDate;
        string title;
        string description;
    }
    
    // Events
    event MilestoneEarned(
        address indexed user,
        uint256 indexed tokenId,
        MilestoneType milestoneType,
        string title,
        uint256 value
    );
    
    constructor() ERC721("BYOB Milestone NFT", "BYOB-MILE") {
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev Mint a milestone NFT to a user
     * @param to Address to mint NFT to
     * @param milestoneType Type of milestone (0-4)
     * @param value Achievement value (amount saved, module completed, etc.)
     * @param title NFT title
     * @param description NFT description
     * @param tokenURI Metadata URI (IPFS link)
     */
    function mintMilestone(
        address to,
        uint8 milestoneType,
        uint256 value,
        string memory title,
        string memory description,
        string memory tokenURI
    ) external onlyOwner {
        require(milestoneType <= 4, "Invalid milestone type");
        require(!hasAchieved[to][milestoneType], "Milestone already earned");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Record achievement
        hasAchieved[to][milestoneType] = true;
        
        // Store milestone data
        milestoneData[tokenId] = MilestoneData({
            milestoneType: MilestoneType(milestoneType),
            value: value,
            achievementDate: block.timestamp,
            title: title,
            description: description
        });
        
        emit MilestoneEarned(to, tokenId, MilestoneType(milestoneType), title, value);
    }
    
    /**
     * @dev Batch mint multiple milestones to save gas
     */
    function batchMintMilestones(
        address[] calldata recipients,
        uint8[] calldata milestoneTypes,
        uint256[] calldata values,
        string[] calldata titles,
        string[] calldata descriptions,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(recipients.length == milestoneTypes.length, "Array length mismatch");
        require(recipients.length == values.length, "Array length mismatch");
        require(recipients.length == titles.length, "Array length mismatch");
        require(recipients.length == descriptions.length, "Array length mismatch");
        require(recipients.length == tokenURIs.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (!hasAchieved[recipients[i]][milestoneTypes[i]] && 
                milestoneTypes[i] <= 4 && 
                recipients[i] != address(0)) {
                
                mintMilestone(
                    recipients[i],
                    milestoneTypes[i],
                    values[i],
                    titles[i],
                    descriptions[i],
                    tokenURIs[i]
                );
            }
        }
    }
    
    /**
     * @dev Get all milestone NFTs owned by a user
     */
    function getUserMilestones(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 index = 0;
        uint256 totalSupply = _tokenIdCounter.current() - 1;
        
        for (uint256 tokenId = 1; tokenId <= totalSupply && index < balance; tokenId++) {
            if (ownerOf(tokenId) == user) {
                tokenIds[index] = tokenId;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Check if user has earned a specific milestone type
     */
    function hasEarnedMilestone(address user, uint8 milestoneType) external view returns (bool) {
        return hasAchieved[user][milestoneType];
    }
    
    /**
     * @dev Get milestone data for a token
     */
    function getMilestoneData(uint256 tokenId) external view returns (MilestoneData memory) {
        require(_exists(tokenId), "Token does not exist");
        return milestoneData[tokenId];
    }
    
    /**
     * @dev Get total number of milestones minted
     */
    function totalMilestones() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    // Override required by Solidity
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}